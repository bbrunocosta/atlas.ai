import * as dotenv from 'dotenv';
dotenv.config();


const start = async client => client.onAnyMessage( console.log );
create().then(start).catch(console.log)