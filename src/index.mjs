import { createWppconnectBot } from './whatsapp/wppconnect-configuration.js';
import { saveMessage } from './data/sqlite-repository.js';
import assistant from './open-ai/assistant.js';
const client = await createWppconnectBot()

const pendingMessages = {
  messages: new Map(),
  clocks: new Map(),
  currentState: new Map()
}


try
{
  client.onPresenceChanged((args) => {
    if(!args) return;

    if(args.state === 'unavailable' && pendingMessages.messages.has(args.id)){
      waitSecondsThenRunAgent(5, args.id)
    }
    
    else if(pendingMessages.clocks.has(args.id)) {
      clearTimeout(pendingMessages.clocks.get(args.id))
      pendingMessages.clocks.delete(args.id)

    }
  });


  client.onAnyMessage( async message => {   
    const messageWasSaved = await saveMessage({ 
      messageId: message.id, 
      chatId: message.fromMe ? message.to : message.from, 
      content: message.caption || message.body || '', 
      role: message.fromMe ? 'assistant' : 'user',
      isReplied: message.fromMe ? 1 : 0
    })

    
    if(messageWasSaved && !message.fromMe) {
      pendingMessages.messages.set(message.from, message)
      waitSecondsThenRunAgent(5, message.from)
    }
  })
}


catch(error)
{
  console.log(error)
  client.close();
}

function waitSecondsThenRunAgent(seconds, chatId){
  if(pendingMessages.clocks.has(chatId)) {
    clearTimeout(pendingMessages.clocks.get(chatId))
    pendingMessages.clocks.delete(chatId);
  }

  pendingMessages.clocks.set(chatId, setTimeout(async () => {
    const message = pendingMessages.messages.get(chatId)
    pendingMessages.messages.delete(chatId)
    pendingMessages.clocks.delete(chatId); 
    await assistant({client, venomMessage: message})
  }, seconds * 1000))
}