import sqlite3 from 'sqlite3';
import { Database } from "sqlite";
import Message from '../domain/entites/message';
import { MessageRepository } from '../domain/repos/messageRepository';
import { UsageRepository } from '../domain/repos/usageRepository';

class Sqlite3RepositoryAdapter implements MessageRepository, UsageRepository{
  constructor(private readonly db: Database<sqlite3.Database, sqlite3.Statement>) {}

  async CreateTables(){
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chatId TEXT,
        role TEXT CHECK(role IN ('user', 'assistant')), 
        text TEXT,
        audio TEXT,
        audioCaption TEXT,
        image TEXT,
        url TEXT,
        fileName TEXT,
        caption TEXT,
        isReplied INTEGER DEFAULT 0, 
        mimeType TEXT,
        timestamp INTEGER,
        lang TEXT
      );
    `);

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS usage (
        chatId TEXT PRIMARY KEY,
        credits REAL NOT NULL DEFAULT 1000
      );
    `);

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS translations(
        lang TEXT,
        id TEXT,
        text TEXT,
        PRIMARY KEY (lang, id)
      );
    `);
  }

   async getCredits(chatId: string) {
    const result = await this.db.get(
      `SELECT credits FROM usage
       WHERE chatId = ?`,
      [chatId]
    );
    return Math.trunc(result?.credits);
  }



  async upsertCredits(chatId: string, ammountSpent: number, isRecharge: boolean) {
    const result = await this.db.get(
      `INSERT INTO usage (chatId)
       VALUES (?)
       ON CONFLICT(chatId) DO UPDATE 
       SET credits = credits ${ isRecharge ? '+' : '-' } ?
       RETURNING credits`,
      [chatId, ammountSpent]
    );
    
    return parseInt(result);
  }

  async saveMessage(message: Message) {
    const result = await this.db.run(
      `INSERT OR IGNORE INTO messages (id, chatId, role, text, audio, audioCaption, image, fileName, caption, isReplied, mimeType, lang, timestamp, url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [message.id, message.chatId, message.role, message.text, message.audio, message.audioCaption, message.image, message.fileName, message.caption, message.isReplied, message.mimeType, message.lang, message.timestamp, message.url]
    );

    return result.changes ? true : false
  }



  async  getChatHistory(chatId: string):Promise<{notReplied: Message[], replied: Message[]}> {
    const result = await this.db.all(
      `
        SELECT 
          JSON_GROUP_ARRAY(JSON_OBJECT('role', role, 'text', text, 'image', image, 'url', url, 'caption', caption, 'audio', audio, 'audioCaption', audioCaption, 'isReplied', isReplied ))
          FILTER (WHERE isReplied = 1) AS replied,
  
          JSON_GROUP_ARRAY(JSON_OBJECT('role', role, 'text', text, 'image', image, 'url', url, 'caption', caption,'audio', audio, 'audioCaption', audioCaption, 'isReplied', isReplied )) 
          FILTER (WHERE isReplied = 0) AS notReplied
        FROM messages
        WHERE chatId = ?;
      `
      ,[chatId]
    );
    const replied = JSON.parse(result[0].replied || '[]') as Message[]
    const notReplied = JSON.parse(result[0].notReplied || '[]') as Message[]
    return {
      replied,
      notReplied
    }
  }



 async getLastMessage(chatId: string) {
  const result = await this.db.all(
    `SELECT * FROM messages 
     WHERE chatId = ?
     ORDER BY timestamp DESC
     LIMIT 1`
    ,[chatId]
  );
  return result[0];
}

 async markMessagesAsReplied(chatId: string) {
  await this.db.run(
    `UPDATE messages 
     SET isReplied = 1 
     WHERE isReplied = 0 AND chatId = ? `,
     [chatId]
  );
}



 async  getTranslation(id: string, lang: string){
  const result = await this.db.get(
    `SELECT text FROM translations WHERE id = ? AND lang = ?`,
    [id, lang]
  );
  return result?.text
}



 async  upsertTranslation(id: string, lang: string, text: string): Promise<string | null>{
  const result = await this.db.get(
    `INSERT INTO translations (id, lang, text) 
    VALUES (?, ?, ?)
    ON CONFLICT(id,lang) DO UPDATE 
    SET text = excluded.text
    RETURNING text`,
    [id, lang, text]
  );
  return result?.text
}

}

export default Sqlite3RepositoryAdapter
