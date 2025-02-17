import * as repository from '../../../data/sqlite-repository.js'

export default {
  type: 'function',
  function: {
    name: "waitForMillisecondsThenSaySomething",
    description: "Aguarda uma quantidade de tempo e, caso o usuário não responda, envia uma mensagem.",
    parameters: {
      type: "object",
      properties: {
        milliseconds: { "type": "number", "description": "Tempo em milissegundos para aguardar." },
        input: { "type": "string", "description": "A mensagem que você deseja enviar." },
        response_type: {
          type: 'string',
          description: 'Define se a reposta deverá ser falada em audio ou enviada via texto',
          enum: ['audio', 'text']
        },
        lang: { type: "string", description: "O idioma do texto enviado pelo usuário" }
      },
      required: ["milliseconds", "input", "response_type", "lang"]
    },
    call ({client, message, milliseconds, input, response_type, lang}) {
      return new Promise((resolve, reject) => {
        console.log(`Aguardando ${milliseconds} se o usuario nao falar nada eu respondo com: ${input}`)
        client.stopTyping(message.from)
        setTimeout(() => {
          client.startTyping(message.from)
            repository.getLastMessage(message.from)
            .then(async lastMessage => {
            
              if(lastMessage.messageId === message.id) {
                await client.sendTextOrBase64AudioPtt({
                  message, response_type, input, lang
                })
              }
              
              resolve()
          })
          .catch(reject)
          .finally(() => {
            client.stopTyping(message.from)
          })
        }, milliseconds)
      })
    }
  }
}
