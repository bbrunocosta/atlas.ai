import { create } from 'venom-bot';


const start = async client => client.onAnyMessage( console.lot );

create({
    session: 'chat-gpt',
    multidevice: true
})
.then(start)
.catch( console.log );