import { create } from 'venom-bot';

const options = {
    session: 'chat-gpt',
    multidevice: true
}

export const createBot = () => create(options)