import { type Whatsapp } from '@wppconnect-team/wppconnect';
import { MessagePort } from '../ports/MessagePort';
import Message from '../domain/entites/message';
import { MessageFactory } from '../domain/entites/messageFactory'

class WppConnectAdapter implements MessagePort
{
  constructor(
    private readonly wppConnectClient: Whatsapp,
    private readonly messageFactory: MessageFactory
  ){}
  onPresenceChanged(callback: (state: {chatId: string, state: string}) => Promise<void>): void {
    console.log('2', )
    this.wppConnectClient.onPresenceChanged( async (wppPresenceChanged) => {
      console.log('entrou aqui')
      try {
        const chatId = wppPresenceChanged.id
        const state = wppPresenceChanged.state
        await callback({chatId, state});
      } catch (error) {
        console.error("WppConnectAdapter.onPresenceChangedError", error);
      }
    })
  }

  onMessage(callback: (message: Message) => Promise<void>): void {
    this.wppConnectClient.onMessage( async (wppMessage) => {
      try {
        const id = wppMessage.id
        const chatId = wppMessage.from
        const role = 'user'
        const text = wppMessage.type === 'chat' ? wppMessage.body ?? '' : ''
        const lang = undefined
        const response_type = undefined

        const audio = wppMessage.type === 'ptt' ? await this.wppConnectClient.downloadMedia(wppMessage) : undefined
        const audioCaption = undefined

        const image = wppMessage.type === 'image' ? await this.wppConnectClient.downloadMedia(wppMessage) : undefined
        const fileName = undefined
        const caption = wppMessage.caption
        const shouldSave = true
          
        const isReplied = false
        const mimeType = wppMessage.mimetype
      
        const timestamp = wppMessage.t

        const message = await this.messageFactory.create(
          id,
          chatId,
          role,
          text,
          
          lang,
          response_type,
          
          audio,
          audioCaption,
          
          image,
          fileName,
          caption,
      
          shouldSave,
          
          isReplied,
          mimeType,
      
          timestamp
        )
        await callback(message);
      } catch (error) {
        console.error("WppConnectAdapter.onMessageError", error);
      }
    })
  }

  async startTyping(chatId: string): Promise<void> {
    await this.wppConnectClient.startTyping(chatId)
  }

  async stopTyping (chatId: string): Promise<void> {
    await this.wppConnectClient.stopTyping(chatId)
  }

  async startRecording (chatId: string) { 
    await this.wppConnectClient.startRecording(chatId)
  }

  async stopRecording (chatId: string) { 
    await this.wppConnectClient.stopRecoring(chatId)
  }


  async sendText(message: Message): Promise<void> {
    if(!message.text) throw new Error('message.text is required')
    await this.wppConnectClient.sendText(message.chatId, message.text)
  }

  async sendAudio(message: Message): Promise<void> {
    if(!message.audio) throw new Error('message.audio is required')
    await this.wppConnectClient.sendFile(message.chatId, message.audio!, { type: 'audio', isPtt: true })
  }
  async sendAudioCaption(message: Message): Promise<void> {
    if(!message.audio) throw new Error('message.audioCaption is required')
    await this.wppConnectClient.sendFile(message.chatId, message.audioCaption!, { type: 'audio', isPtt: true })
  }
  async sendImageWithCaption(message: Message): Promise<void> {
    if(!message.image) throw new Error('message.image is required')
    if(!message.caption) throw new Error('message.caption is required')
    if(!message.fileName) throw new Error('message.caption is required')

    await this.wppConnectClient.sendImageFromBase64(message.chatId, message.image, message.fileName, message.caption);
  }
  async sendImage(message: Message): Promise<void> {
    if(!message.image) throw new Error('message.image is required')
    if(!message.fileName) throw new Error('message.caption is required')

    await this.wppConnectClient.sendImageFromBase64(message.chatId, message.image, message.fileName);
  }

  async stopPresence(chatId: string): Promise<void> {
    await this.wppConnectClient.stopRecoring(chatId)
    await this.wppConnectClient.stopTyping(chatId)
  }
}

export default WppConnectAdapter