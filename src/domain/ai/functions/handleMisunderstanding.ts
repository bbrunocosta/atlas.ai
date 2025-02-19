import { AiFunctionCallDescription } from "./AiFunctionCall";

export default {
  name: "handleMisunderstanding",
  description: "Says to the user that you don't understand'.",
  parameters: {
    type: "object",
    properties: {
      message: { "type": "string", "description": "A mensagem que você deseja enviar." },
      response_type: {
        type: 'string',
        description: 'Define se a reposta deverá ser falada em audio ou enviada via texto',
        enum: ['audio', 'text']
      },
      lang: { type: "string", description: "O idioma do texto enviado pelo usuário" }
    },
    required: ["message", "response_type", "lang"]
  }
} as AiFunctionCallDescription