import { create } from 'venom-bot';

export const options = {
    session: 'chat-gpt',
    multidevice: false,
    browserArgs: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox']
}

export const createVenomBot = () => create(options)