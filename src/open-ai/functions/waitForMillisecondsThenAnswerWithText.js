import { getLastMessage } from '../../data/sqlite-repository.js'

export const waitForMillisecondsThenAnswerWithText =  ({client, venomMessage, milliseconds, message}) => new Promise((resolve, reject) => {
  console.log(`Aguardando ${milliseconds} se o usuario nao falar nada eu respondo com: ${message}`)
  setTimeout(() => {
    getLastMessage(venomMessage.from)
      .then(lastMessage => {
      
        if(lastMessage.id === venomMessage.id) {
          client.sendText(venomMessage.from, message)
        }
        
        resolve()
    })
    .catch(reject)
  }, milliseconds)
})
 