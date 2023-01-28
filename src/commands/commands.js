import { getDavinciResponse, getDalleResponse } from '../open-ai/index.js';
import * as responseTypes from '../whatsapp/responseTypes.js'
import * as commandTypes from './commandTypes.js'

const davinciRequestCommand = { 
    action: getDavinciResponse,
    responseType: responseTypes.text
}

const dalleRequestCommand = { 
    action: getDalleResponse,
    responseType: responseTypes.img
}

const commands = {
    [commandTypes.bot]: davinciRequestCommand,
    [commandTypes.imagine]: dalleRequestCommand
}

export const  getCommand = commandType => (commands[commandType] || null)
