import * as responseTypes from "./responseTypes.js";
import * as dotenv from 'dotenv'
dotenv.config()

export const sendResponseAsText = (client, message, text ) => client.sendText(
    message.from === process.env.WHATSAPP_PHONE_NUMBER ? message.to : message.from,
    text
)

export const sendResponseAsImg= (client, message, imgUrl, imgDescription ) => client.sendImage(
    message.from === process.env.WHATSAPP_PHONE_NUMBER ? message.to : message.from,
    imgUrl,
    imgDescription,
    'Imagem gerada pela IA DALL-E 🤖'
);

const responseHandlerCollection = {
    [responseTypes.text]: sendResponseAsText,
    [responseTypes.img]: sendResponseAsImg
}

export const getResponseHandler = responseType => (responseHandlerCollection[responseType] || null)