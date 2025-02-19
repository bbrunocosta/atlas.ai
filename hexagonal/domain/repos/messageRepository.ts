import Message from "../entites/message";

export interface MessageRepository
{
  saveMessage(message: Message): Promise<boolean>
  CreateTables(): Promise<void>
}