import { createWppconnectBot } from './whatsapp/wppconnect-configuration.js';
const client = await createWppconnectBot()

try
{
  client.instance.onPresenceChanged((args) => {
    if(!args) return;
    if(!client.isMaintenance && args.state === 'unavailable' && client.messages.has(args.id)) {
      client.waitSecondsThenRunAgent(3, args.id)
    }
    else if(client.clocks.has(args.id)) {
      clearTimeout(client.clocks.get(args.id))
      client.clocks.delete(args.id)
    }
  });

  client.instance.onMessage( async message => {
    const isMessageSaved = await client.saveMessage(message)

    if(isMessageSaved) {
      if(!client.isMaintenance &&  client.isMessageFromMaintainer(message)) return;
      
      if(client.isMaintenance &&  !client.isMessageFromMaintainer(message)) {
        await client.sendMaintenanceWarn({message, lang:'pt', response_type: 'text'})
      }else {
        client.messages.set(message.from, message)
        client.waitSecondsThenRunAgent(3, message.from)
      }
    }
  })
}


catch(error)
{
  console.log(error)
  client.close();
}

