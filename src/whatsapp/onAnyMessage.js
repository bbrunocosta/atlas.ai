import { getResponseHandler } from "./responseHandlers.js";
import {getTextResponse} from '../open-ai/functions/getTextResponse.js'

const repliedMessages = new Set()
export const onAnyMessage = async (client, message) => {
    if(message.from !== '5511959963068@c.us' && !repliedMessages.has(message.id)){
        await client.startTyping(message.from);
        repliedMessages.add(message.id)
        const {responseType, fileName, data, text }  = await getTextResponse(message)
        const responseHandler  = getResponseHandler(responseType)
        await responseHandler(client, message, text ?? '', fileName, data)
    }
}