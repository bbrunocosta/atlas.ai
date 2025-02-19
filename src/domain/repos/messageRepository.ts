import Message from "../entites/message";

export interface MessageRepository
{
  saveMessage(message: Message): Promise<boolean>
  CreateTables(): Promise<void>
  getChatHistory(chatId: string):Promise<{replied: Message[], notReplied: Message[]}>
  getTranslation(id: string, lang: string): Promise<string>
  upsertTranslation(id: string, lang: string, text: string): Promise<string>
}