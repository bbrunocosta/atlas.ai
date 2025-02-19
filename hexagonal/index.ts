import Sqlite3RepositoryAdapter from "./adapters/sqlite3RepositoryAdapter.ts";
import RedisEventBussAdapter from "./adapters/redisEventBussAdapter.ts";
import WppConnectAdapter from "./adapters/wppConnectAdapter.ts";
import RedisStoreAdapter from "./adapters/redisStoreAdapter.ts";
import wppConnectConfig from "./config/wppConnectConfig.ts"
import OpenAiAdapter from "./adapters/openAiAdapter.ts"
import wppconnect from '@wppconnect-team/wppconnect';
import sqlite3Config from "./config/sqlite3-config.ts";
import redisConfig from './config/redisConfig.ts'
import Redis from "ioredis";

import { MessageRepository } from "./domain/repos/messageRepository.ts";
import { MessageFactory } from "./domain/entites/messageFactory.ts";
import { UsageRepository } from "./domain/repos/usageRepository.ts";
import { EventBussPort } from "./ports/eventBussPort.ts";
import { MessagePort } from "./ports/MessagePort.ts";
import { StorePort } from "./ports/storePort.ts";
import { EventEmitter } from "events";
import { open } from 'sqlite';


const db = await open(sqlite3Config);
const redisPublisher = new Redis(redisConfig)
const redisSubscriber = new Redis(redisConfig)
const wppConnectClient = await wppconnect.create(wppConnectConfig);
const openAiAdapter = new OpenAiAdapter()



const eventEmitter = new EventEmitter()

const eventBuss: EventBussPort = new RedisEventBussAdapter( redisPublisher, redisSubscriber, eventEmitter)
const eventStore: StorePort = new RedisStoreAdapter(redisPublisher)

const messageRepository: MessageRepository = new Sqlite3RepositoryAdapter(db)
const usageRepository: UsageRepository = new Sqlite3RepositoryAdapter(db)
await messageRepository.CreateTables()


const messageFactory = new MessageFactory(openAiAdapter, messageRepository, usageRepository)
const messageClient: MessagePort = new WppConnectAdapter(wppConnectClient, messageFactory)



messageClient.onPresenceChanged(async changeState => {
  try {
    await eventStore.savePresenceState(changeState)
    await eventBuss.emitDebounced(changeState.chatId, changeState.state, 3)
  }
  
  catch(error)
  {
    console.error('messageClient.onPresenceChanged.callbackError', error)
  }
})


messageClient.onMessage(async message => {
  await eventStore.savePendingMessageReceived(message)
  await eventBuss.emitDebounced(message.chatId, 'unavailable', 3)
})

eventEmitter.on('debounced', async chatId => {
  console.log('calling: ', 'eventHandlers_ondebounced')

  const currentChangeState = await eventStore.getPresenceState(chatId)
  if(currentChangeState?.state === 'unavailable') {
    const message = await eventStore.retrievePendingMessageReceived(chatId)
    if(message) {
      eventStore.deleteAllMessages(chatId)
      eventEmitter.emit('message', message)
    }
  }
})

eventEmitter.on('message', async (message) => {
  console.log(`📩 Nova mensagem recebida do chat ${message.chatId}:`);
  console.dir(message, {depth: null})
})

