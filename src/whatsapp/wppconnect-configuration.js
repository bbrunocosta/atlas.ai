import wppconnect from '@wppconnect-team/wppconnect';

export const createWppconnectBot = () => {
    return wppconnect.create({
        session: 'chat-gpt-2',
        statusFind: (statusSession, session) => {
            console.log(`Status da sessão ${session}: ${statusSession}`);
        },
        headless: true,
        useChrome: false,
        autoClose: 0,
        useSession: true,
        onSelfMessage: true,
        folderNameToken: './tokens',
        browserArgs: ['--no-sandbox', '--disable-setuid-sandbox']
    });
};
