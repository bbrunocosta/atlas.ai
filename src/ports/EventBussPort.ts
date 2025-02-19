import Message from "../domain/entites/message"

export interface EventBussPort
{  
  emitMessageSent(message: Message): Promise<void>
  emitPresenceStateDebounced (state: {state: string, chatId: string}, seconds: number): Promise<void>
  enqueueMessage (message: Message): Promise<void>
  getMessagesCount(chatId: string): Promise<number>
  
  onMessageSent(callback: (message: Message) => Promise<void>): void
  onMessageReceived(callback: (message: Message) => Promise<void>): void
  onPresenceStateDebounced(callback: (currentState: { chatId: string; state: string; }) => Promise<void>): void
}