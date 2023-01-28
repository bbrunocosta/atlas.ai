import * as dotenv from 'dotenv';
dotenv.config();
import { createBot } from  './whatsapp/index.js'

const start = async client => client.onAnyMessage( console.log );
createBot().then(start).catch(console.log)