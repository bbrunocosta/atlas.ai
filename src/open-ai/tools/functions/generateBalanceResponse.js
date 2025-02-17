import * as repository from '../../../data/sqlite-repository.js'

export default {
  type: 'function',
  function: {
    name: 'generateBalanceResponse',
    description: "Returns how many credits the user have.",
    parameters: {
        type: "object",
        properties: {
          input: { 
            type: "string", 
            description: `the exact Translation for this text in the same lang of user: 'Your current balance is {0} créditos' do not modify the number!`
          },                           
          response_type: {
            type: 'string',
            description: 'Defines if the input shuld be sent sent as text or audio',
            enum: ['audio', 'text']
          },
          lang: { type: "string", description: "The language you are talking with the user by now" }
        },
        required: ["input", 'response_type', 'lang']
    },
    async call ({client, message, response_type, input, lang }) {
      const balance = await repository.getCredits(message.from)
      const balanceMessage = input.replace('{0}', balance)
      await client.sendTextOrBase64AudioPtt({
        message, response_type, input: balanceMessage, lang
      })
    }
  }
}