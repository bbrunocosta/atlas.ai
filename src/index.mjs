import { createVenomBot } from './whatsapp/venombot-configuration.js';
import { saveMessage } from './data/sqlite-repository.js';
import assistant from './open-ai/assistant.js';
const client = await createVenomBot()

try
{
  client.onAnyMessage( async message => {   

    console.log( message.fromMe, 'onAnyMessage', message.id, message.body)

    const messageWasSaved = await saveMessage({ 
      messageId: message.id, 
      chatId: message.fromMe ? message.to : message.from, 
      content: message.caption || message.body || '', 
      role: message.fromMe ? 'assistant' : 'user',
      isReplied: message.fromMe ? 1 : 0
    })

    if(messageWasSaved && !message.fromMe) await assistant({client, venomMessage: message})
  })
}


catch(error)
{
  console.log(error)
  client.close();
}