import * as responseTypes from "./responseTypes.js";
import * as dotenv from 'dotenv'
dotenv.config()

export const sendResponseAsText = async (client, message, text ) => await client.sendText(
    message.from === process.env.WHATSAPP_PHONE_NUMBER ? message.to : message.from,
    text
)

export const sendResponseAsImg = async (client, message, text, fileName, data ) => await client.sendImageFromBase64(
    message.from === process.env.WHATSAPP_PHONE_NUMBER ? message.to : message.from,
    data,
    fileName,
    text
);

const responseHandlerCollection = {
    [responseTypes.text]: sendResponseAsText,
    [responseTypes.img]: sendResponseAsImg
}

export const getResponseHandler = responseType => (responseHandlerCollection[responseType] || null)