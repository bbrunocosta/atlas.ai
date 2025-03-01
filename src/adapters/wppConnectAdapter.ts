import { type Whatsapp } from '@wppconnect-team/wppconnect'
import { AudioMessageOptions } from '@wppconnect/wa-js/dist/chat'
import { MessagePort } from '../ports/MessagePort';
import Message from '../domain/entites/message';
import { MessageFactory } from '../domain/entites/messageFactory'

import { EventBussPort } from '../ports/EventBussPort';

class WppConnectAdapter implements MessagePort
{
  constructor(
    private readonly wppConnectClient: Whatsapp,
    private readonly messageFactory: MessageFactory,
    private readonly fileStorePort: FileStorePort,
    private readonly eventBussPort: EventBussPort
  ){}

  onMessageReceived(callback: (message: Message) => Promise<void>): void {
    this.wppConnectClient.onMessage(async wppConnectMessage => {
      if(!['chat', 'ptt', 'image'].includes(wppConnectMessage.type)){
        await this.eventBussPort.emitNotSuportedMessageType(wppConnectMessage.from)
        return;
      }

      try {
        const audio = wppConnectMessage.type === 'ptt' ? await this.wppConnectClient.downloadMedia(wppConnectMessage) : null
        const image = wppConnectMessage.type === 'image' ? await this.wppConnectClient.downloadMedia(wppConnectMessage): null
        const url =  wppConnectMessage.type === 'image' ? await this.fileStorePort.set(wppConnectMessage.id.replace('@c.us', '__'), Buffer.from(image.split('base64,',)[1], 'base64'), wppConnectMessage.mimetype)  : null
        const message = await this.messageFactory.FromUser
        (
          wppConnectMessage.id, 
          wppConnectMessage.from,
          wppConnectMessage.body,
          audio,
          image,
          url,
          wppConnectMessage.mimetype,
          wppConnectMessage.caption,
          wppConnectMessage.t
        )
        callback(message)

      }
      catch (error) {
        console.error('WppConnectAdapter.fowardMessagesToEventBuss',error)
      }
    })
  }

  onPresenceChanged(callback: (state: {chatId: string, state: string}) => Promise<void>): void {
    this.wppConnectClient.onPresenceChanged( async (wppPresenceChanged) => {
      try {
        const chatId = wppPresenceChanged.id
        const state = wppPresenceChanged.state
        await callback({chatId, state});
      } catch (error) {
        console.error("WppConnectAdapter.onPresenceChangedError", error);
      }
    })
  }

  async sendMessage(message: Message): Promise<void>{
    try {

      if(message.image && message.audioCaption) {
        await this.startRecording(message.chatId)
        await this.sendImage(message)
        await this.sendAudioCaption(message)
        return;
      }

      if(message.image && !message.audioCaption){
        await this.startTyping(message.chatId)
        await this.sendImageWithCaption(message)
        return ;
      }

      if(message.audio) {
        await this.sendAudio(message)
        return ;
      }
      

      await this.sendText(message)

    }

    catch(error) {
      console.error('sendMessage', error)
    }
    
    finally{
      this.stopPresence(message.chatId)
    }
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
    const wppMessage = await this.wppConnectClient.sendText(message.chatId, message.text)
    message.withId(wppMessage.id)
    message.withTimestamp(wppMessage.t)
    await this.eventBussPort.emitMessageSent(message)
  }


  async sendAudio(message: Message): Promise<void> {
    if(!message.audio) throw new Error('message.audio is required')
    const wppMessage = await this.wppConnectClient.sendFile(message.chatId, message.audio!, { type: 'audio', isPtt: true } as any)
    message.withId(wppMessage.id)
    await this.eventBussPort.emitMessageSent(message)
  }


  async sendAudioCaption(message: Message): Promise<void> {
    if(!message.audioCaption) throw new Error('message.audioCaption is required')
    const options: AudioMessageOptions = {
      type: 'audio',
      isPtt: true
    }
    const wppMessage = await this.wppConnectClient.sendFile(message.chatId, message.audioCaption, options)
    message.withId(wppMessage.id)
    message.withTimestamp(wppMessage.t)
    await this.eventBussPort.emitMessageSent(message)

  }


  async sendImageWithCaption(message: Message): Promise<void> {
    if(!message.image) throw new Error('message.image is required')
    if(!message.caption) throw new Error('message.caption is required')
    if(!message.fileName) throw new Error('message.caption is required')
    const wppMessage =  await this.wppConnectClient.sendImageFromBase64(message.chatId, message.image, message.fileName, message.caption);
    message.withId(wppMessage.id)
    // message.withTimestamp(wppMessage.t)
    await this.eventBussPort.emitMessageSent(message)
  }


  async sendImage(message: Message): Promise<void> {
    if(!message.image) throw new Error('message.image is required')
    if(!message.fileName) throw new Error('message.caption is required')
    const wppMessage = await this.wppConnectClient.sendImageFromBase64(message.chatId, message.image, message.fileName);
    message.withId(wppMessage.id)
    // message.withTimestamp(wppMessage.t)
    await this.eventBussPort.emitMessageSent(message)
  }

  async stopPresence(chatId: string): Promise<void> {
    await this.wppConnectClient.stopRecoring(chatId)
    await this.wppConnectClient.stopTyping(chatId)
  }

}

export default WppConnectAdapter