import Message from "../domain/entites/message";


export interface StorePort
{
  saveMessage (message: Message): Promise<void>;
  getLastMessages (id: string): Promise<Message[]>;
  deleteAllMessages(chatId: string): Promise<void>
  savePresenceState (changeState: {chatId: string, state: string}): Promise<void>;
  getPresenceState (id: string): Promise<{chatId: string, state: string} | null>;
  savePendingMessageReceived (message: Message): Promise<void>;
  retrievePendingMessageReceived (id: string): Promise<Message | null>;
  
  deleteUntil(chatId: string, timestamp): Promise<void>
  getChatMetadata(chatId: string): Promise<{lang: string, response_type: 'text' | 'audio'} | null>
  setChatMetadata(chatId: string, metadata:{ response_type: 'text' | 'audio', lang: string }): Promise<void>

  isReplying(chatId: string): Promise<boolean>
  
  startReplying(chatId: string): Promise<void>

  stopReplying(chatId: string): Promise<void>
}