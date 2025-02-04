import { create } from 'venom-bot';

const options = {
    session: 'chat-gpt',
    multidevice: true,
    browserArgs: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox']
}

export const createBot = () => create(options)