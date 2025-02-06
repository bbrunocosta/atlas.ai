import { getImageResponse } from './functions/getImageResponse.js'
import { waitForMillisecondsThenAnswerWithText } from './functions/waitForMillisecondsThenAnswerWithText.js'
const functions = [
    {
        name: "getImageResponse",
        description: "Gera uma imagem baseada na solicitação do usuário.",
        parameters: {
            type: "object",
            properties: {
                userRequest: { type: "string", description: "Texto completo que o usuário te enviou" },
                message: { type: "string", description: "Uma mensagem para o usuário em primeira pessoa solciando de forma objetiva para aguardar " }
            },
            required: ["userRequest", "message"]
        },
        call:  getImageResponse
    },
    {
        name: "waitForMillisecondsThenAnswerWithText",
        description: "Aguarda uma quantidade de tempo e, caso o usuário não responda, envia uma mensagem.",
        parameters: {
          type: "object",
          properties: {
            "milliseconds": { "type": "number", "description": "Tempo em milissegundos para aguardar." },
            "message": { "type": "string", "description": "A mensagem que você deseja enviar." }
          },
          required: ["milliseconds", "message"]
        },
        call:  waitForMillisecondsThenAnswerWithText
    }
]

export default new Map(functions.map(item => [item.name, item]))