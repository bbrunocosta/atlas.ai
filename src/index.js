import { onAnyMessage } from './whatsapp/index.js';
import * as commands from './commands/index.js';
import { createBot } from  './whatsapp/index.js'

const start = async client => client.onAnyMessage( message => onAnyMessage(client, message, commands) );
createBot().then(start).catch(console.log)