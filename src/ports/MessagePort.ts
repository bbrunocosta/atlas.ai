import Message from "../domain/entites/message";

export interface MessagePort{
  stopTyping(id: string): Promise<void>
  startTyping(id: string): Promise<void>
  startRecording(id: string): Promise<void>
  stopPresence(id: string): Promise<void>
  
  sendText(message: Message): Promise<void>
  sendAudio(message: Message): Promise<void>
  sendAudioCaption(message: Message): Promise<void>
  sendImageWithCaption(message: Message): Promise<void>
  sendImage(message: Message): Promise<void>
  

  sendMessage(message: Message): Promise<void>

  onMessageReceived(callback: (message: Message) =>  Promise<void>): void
  onPresenceChanged(callback: (state: {chatId: string, state: string}) => Promise<void>): void
}