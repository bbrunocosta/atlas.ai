import * as responseTypes from '../whatsapp/responseTypes.js'
import { getImageResponse } from './functions/getImageResponse.js'
const functions = [
    {
        name: "getImageResponse",
        description: "Gera uma imagem baseada em uma descrição textual.",
        responseType: responseTypes.img,
        parameters: {
            type: "object",
            properties: {
                prompt: { type: "string", description: "Descrição da imagem a ser gerada." }
            },
            required: ["prompt"]
        },
        call:  getImageResponse
    }
]

export default new Map(functions.map(item => [item.name, item]))