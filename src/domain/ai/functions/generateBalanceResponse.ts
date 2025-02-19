import { AiFunctionCallDescription } from "./AiFunctionCall";

export default {
  name: 'generateBalanceResponse',
  description: "Returns how many credits the user have.",
  parameters: {
    type: "object",
    properties: {
      message: { 
        type: "string", 
        description: `the exact Translation for this text in the same lang of user: 'Your current balance is 0 créditos' do not modify the number!`
      },                           
      response_type: {
        type: 'string',
        description: 'Defines if the input shuld be sent sent as text or audio',
        enum: ['audio', 'text']
      },
      lang: { type: "string", description: "The language you are talking with the user by now" }
    },
    required: ["message", 'response_type', 'lang']
  }
} as AiFunctionCallDescription