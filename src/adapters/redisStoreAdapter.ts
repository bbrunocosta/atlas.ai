
import Message from '../domain/entites/message.js';
import { StorePort } from '../ports/StorePort.js';
import type { Redis } from 'ioredis';

class redisStoreAdapter implements StorePort
{
  constructor(private readonly redis: Redis){}

  async savePendingMessageReceived (message: Message) { 
    try{
      await this.redis.set(`pending_message_received:${message.chatId}`, JSON.stringify(message))
    }
    
    catch(error) {
      console.error( 'redisStoreAdapter_savePendingMessageReceived', error)
      throw error
    }
  }
  
  async retrievePendingMessageReceived (id: string) { 
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
    try{
      await this.redis.set(`last_message_received:${message.chatId}`, JSON.stringify(message))
    }
    
    catch(error) {
      console.error( 'redisStoreAdapter_saveLastMessage', error)
      throw error
    }
  }

  async saveMessage (message: Message) { 
    try{
      if(!message.chatId) throw new Error('redisStoreAdapter.saveMessage: chatId is required')
      if(!message.timestamp) throw new Error('redisStoreAdapter.saveMessage: timestamp is required')

      await this.redis.zadd(`message:${message.chatId}`, message.timestamp, JSON.stringify(message))
    }
    
    catch(error) {
      console.error( 'redisStoreAdapter_saveMessage', error)
      throw error
    }
  }


  async deleteUntil(chatId: string, timestamp: number): Promise<void> {
    try {
      await this.redis.zremrangebyscore(`message:${chatId}`, '-inf', timestamp);
    } catch (error) {
      console.error('redisStoreAdapter.deleteUntil', error);
      throw error;
    }
  }


  async deleteAllMessages(chatId: string): Promise<void> {
  
    try {
      await this.redis.del(`message:${chatId}`);
    } catch (error) {
      console.error('redisStoreAdapter_deleteAllMessages', error);
      throw error;
    }
  }
  
  async getLastMessages (chatId: string): Promise<Message[]>{

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

    try {
      await this.redis.set(`chage_state:${changeState.chatId}`, changeState.state)
    }

    catch(error) {
      console.error(`redisStoreAdapter_savePresenceState`, error)
      throw error
    }
  }

  async getPresenceState (chatId: string): Promise< {chatId: string, state: string} | null>{

    try {
      const state = await this.redis.get(`chage_state:${chatId}`)
      return state ? {chatId, state} : null
    } 
    
    catch(error) {
      console.error('redisStoreAdapter_getPresenceState', error)
      throw error
    }
  }

  async getChatMetadata(chatId: string): Promise<{lang: string, response_type: 'text' | 'audio'} | null>
  {
    try {
      const result = await this.redis.get(`chat_metadata:${chatId}`)
      return result ? JSON.parse(result) : null
    } 
    
    catch(error) {
      console.error('redisStoreAdapter_getChatMetadata', error)
      throw error
    }
  }

  async setChatMetadata(chatId: string, metadata:{ response_type: 'text' | 'audio', lang: string }): Promise<void>
  {
    try {
      if(!metadata.response_type || !metadata.lang) throw new Error('lang and response_type is required!')
      await this.redis.set(`chat_metadata:${chatId}`, JSON.stringify(metadata))
    }

    catch(error) {
      console.error(`redisStoreAdapter_setChatMetadata`, error)
      throw error
    }
  }
}


export default redisStoreAdapter;
