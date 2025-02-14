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

    if(process.env.NODE_ENV !== 'maintenance' && args.state === 'unavailable' && pendingMessages.messages.has(args.id)) {
      waitSecondsThenRunAgent(3, args.id)
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
      if(process.env.NODE_ENV === 'maintenance') {
        client.sendText(message.from, `📢 Aviso de Manutenção 🚧
Olá! No momento, estou passando por uma manutenção para melhorar minhas habilidades e serviços. 🔧
Peço desculpas pelo transtorno e agradeço  a sua paciência. Estarei de volta em breve! ⏳
Se precisar de mais informações, fique à vontade para entrar em contato com o Bruno.
O WhatsAp dele é:
☎️ +55 11 95996-3068`)
        }else {
          pendingMessages.messages.set(message.from, message)
          waitSecondsThenRunAgent(10, message.from)
        }
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