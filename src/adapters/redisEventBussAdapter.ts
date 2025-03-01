import EventEmitter from "events";
import { EventBussPort } from "../ports/EventBussPort";
import Redis from "ioredis";
import Message from "../domain/entites/message";


class RedisEventBussAdapter implements EventBussPort{
  private emitter = new EventEmitter()
  
  constructor(
    private readonly publisher: Redis,
    private readonly subscriber: Redis
  )
  {
    this.fowardExpiredEvents()
    this.fowardMessagesEvents()
  }


  async emitNotSuportedMessageType(chatId: string): Promise<void> {
    await this.publisher.publish('not_supported_message_type', JSON.stringify(chatId))
  }

  async emitMessageSent(message: Message): Promise<void> {
    await this.publisher.publish('message_sent', JSON.stringify(message))
  }


  async enqueueMessage (message: Message): Promise<void> { 
    await this.publisher.zadd(`message:${message.chatId}`, message.timestamp, JSON.stringify(message))
  }

  async getMessagesCount(chatId: string): Promise<number> {
    if(!chatId) throw new Error('getMessagesCount.chatId is required')
    const result =  await this.publisher.zcount(`message:${chatId}`, '-inf', '+inf')
    return  result
  }


  onNotSuportedMessageType(callback: (chatId: string) => Promise<void>): void {
    try { 
      this.subscriber.subscribe('not_supported_message_type')
      this.emitter.on('not_supported_message_type', async (chatId: string) => {
        await callback(chatId) 
      })
    }
    catch(error){ 
      console.error('RedisEventBussAdapter.onNotSuportedMessageType.callback.Error') 
    }
  }

  onMessageSent(callback: (message: Message) => Promise<void>): void {
    try { 
      this.subscriber.subscribe('message_sent')
      this.emitter.on('message_sent', async (message: Message) => {
        await callback(message) 
      })
    }
    catch(error){ 
      console.error('RedisEventBussAdapter.onMessageSent.callback.Error') 
    }
  }

  onMessageReceived(callback: (message: Message) => Promise<void>): void {
    this.emitter.on('message_received', async (message: Message) => {
      try { 
        await callback(message) 
      }
      catch(error){ 
        console.error('RedisEventBussAdapter.onMessageReceived.callback.Error') 
      }
    })
  }

  onPresenceStateDebounced(callback: (state: { chatId: string; state: string; }) => Promise<void>): void {
    this.emitter.on('presence_state', async (state: { chatId: string; state: string; }) => {
      try { 
        await callback(state) 
      }
      catch(error){ 
        console.error('RedisEventBussAdapter.onPresenceStateDebounced.callback.Error')
      }
    })
  }


  async emitPresenceStateDebounced (state: {state: string, chatId: string}, seconds: number): Promise<void> {
    if(!state.chatId) throw new Error('emitPresenceStateDebounced: chatid is required')
    try { 
      await this.publisher.set(`presence_state:${state.chatId}`, state.chatId, 'EX', seconds)
      await this.publisher.set(`presence_state:${state.chatId}:data`, JSON.stringify(state))
    }
    catch(error){ 
      console.error('RedisEventBussAdapter.emitPresenceStateDebounced.Error')
    }
  }


  private fowardExpiredEvents() {

    this.subscriber.psubscribe('__keyevent@0__:expired', (err, count) => {
      if (err) console.error('Erro ao assinar eventos expirados:', err);
      console.info(`✅ Ouvindo eventos de expiração...`);
    });



    this.subscriber.on('pmessage', async (pattern, channel, expiredKey) => {
      try {
        const data = await this.publisher.get(expiredKey + ':data')
        if(data) this.emitter.emit(expiredKey.split(':')[0], JSON.parse(data))
        else this.emitter.emit('debounced', expiredKey)
      }
      catch(error) {
        console.error('RedisEventBussAdapter.fowardExpiredEvents.on.pmessage', error)
      }
    })
  }


  private fowardMessagesEvents() {
    this.subscriber.on('message', async (channel, data) => {
      const event = channel.split(':')[0]
      this.emitter.emit(event, JSON.parse(data))
    })
  }
}


export default RedisEventBussAdapter