export default {
  session: 'chat-gpt-2',
  headless: true,
  useChrome: false,
  autoClose: 0,
  useSession: true,
  onSelfMessage: true,
  folderNameToken: './tokens',
  browserArgs: ['--no-sandbox', '--disable-setuid-sandbox']
}