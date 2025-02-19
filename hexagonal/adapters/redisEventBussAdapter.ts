import { EventBussPort } from "../ports/eventBussPort";
import EventEmitter from "events";
import Redis from "ioredis";

class RedisEventBussAdapter implements EventBussPort{
  constructor(
    private readonly publisher: Redis,
    private readonly subscriber: Redis,
    private readonly eventEmitter: EventEmitter
  )
  {
    this.fowardExpiredEvents(this.eventEmitter)
    this.fowardMessagesEvents(this.eventEmitter)
  }

  private fowardExpiredEvents(eventEmitter: EventEmitter) {
    this.subscriber.psubscribe('__keyevent@0__:expired', (err, count) => {
      if (err) console.error('Erro ao assinar eventos expirados:', err);
      console.log(`✅ Ouvindo eventos de expiração...`);
    });


    this.subscriber.on('pmessage', async (pattern, channel, expiredKey) => {
      if(expiredKey.startsWith('debounced:')) {
        const id = expiredKey.replace('debounced:', '')
        eventEmitter.emit('debounced', id)
      }else {
        eventEmitter.emit('expired', expiredKey)
      }
    })
  }


  private fowardMessagesEvents(eventEmitter: EventEmitter) {
    this.subscriber.on('message', async (channel, data) => {
      await eventEmitter.emit(channel, data)
    })
  }


  async emit( eventId: string, data: string ) {
    await this.publisher.publish(eventId, data);
  }
  

  async emitDebounced (id: string, data: string, seconds: number) { 
    await this.publisher.set(`debounced:${id}`, data, 'EX', seconds)
  }
}


export default RedisEventBussAdapter