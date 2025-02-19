
import { json } from 'stream/consumers';
import Message from '../domain/entites/message';
import { StorePort } from '../ports/storePort';
import type { Redis } from 'ioredis';

class redisStoreAdapter implements StorePort
{
  constructor(private readonly redis: Redis){}

  async savePendingMessageReceived (message: Message) { 
    console.log('calling: ', 'redisStoreAdapter_savePendingMessageReceived')
    try{
      await this.redis.set(`pending_message_received:${message.chatId}`, JSON.stringify(message))
    }
    
    catch(error) {
      console.error( 'redisStoreAdapter_savePendingMessageReceived', error)
      throw error
    }
  }
  
  async retrievePendingMessageReceived (id: string) { 
    console.log('calling: ', 'redisStoreAdapter_getPendingMessageReceived')
    try{
      const result = await this.redis.getdel(`pending_message_received:${id}`)
      return result? JSON.parse(result) : null
    }
    
    catch(error) {
      console.error( 'redisStoreAdapter_retrievePendingMessageReceived', error)
      throw error
    }
  }

  async clearLastMessageReceived (message: Message) { 
    console.log('calling: ', 'redisStoreAdapter_saveLastMessage')
    try{
      await this.redis.set(`last_message_received:${message.chatId}`, JSON.stringify(message))
    }
    
    catch(error) {
      console.error( 'redisStoreAdapter_saveLastMessage', error)
      throw error
    }
  }

  async saveMessage (message: Message) { 
    console.log('calling: ', 'redisStoreAdapter_saveMessage')
    try{
      await this.redis.zadd(`message:${message.chatId}`, message.timestamp!, JSON.stringify(message))
    }
    
    catch(error) {
      console.error( 'redisStoreAdapter_saveMessage', error)
      throw error
    }
  }

  async deleteAllMessages(chatId: string): Promise<void> {
    console.log('calling: ', 'redisStoreAdapter_deleteAllMessages');
  
    try {
      await this.redis.del(`message:${chatId}`);
    } catch (error) {
      console.error('redisStoreAdapter_deleteAllMessages', error);
      throw error;
    }
  }
  
  async getLastMessages (chatId: string): Promise<Message[]>{
    console.log('calling: ', 'redisStoreAdapter_getLastMessage')

    try {
      const result = await this.redis.zrevrange(`message:${chatId}`, 0, -1);
      const parsed: Message[] = result.map(item => JSON.parse(item))
      return parsed
    }

    catch(error) {
      console.error('redisStoreAdapter_getLastMessage', error)
      throw error
    }
  }

  async savePresenceState (changeState: {chatId: string, state: string}) { 
    console.log('calling: ', 'redisStoreAdapter_savePresenceState')

    try {
      await this.redis.set(`chage_state:${changeState.chatId}`, changeState.state)
    }

    catch(error) {
      console.error(`redisStoreAdapter_savePresenceState`, error)
      throw error
    }
  }

  async getPresenceState (chatId: string): Promise< {chatId: string, state: string} | null>{
    console.log('calling: ', 'redisStoreAdapter_getPresenceState')

    try {
      const state = await this.redis.get(`chage_state:${chatId}`)
      return state ? {chatId, state} : null
    } 
    
    catch(error) {
      console.error('redisStoreAdapter_getPresenceState', error)
      throw error
    }
  }
}


export default redisStoreAdapter;
