import { getImageResponse } from './functions/getImageResponse.js'
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
    }
]

export default new Map(functions.map(item => [item.name, item]))