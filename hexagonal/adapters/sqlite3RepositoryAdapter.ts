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
        lang TEXT,
        response_type TEXT CHECK(response_type IN ('text', 'audio')),
        audio TEXT,
        audioCaption TEXT,
        image TEXT,
        fileName TEXT,
        caption TEXT,
        isReplied INTEGER DEFAULT 0, 
        mimeType TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
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
    console.log(Math.trunc(result?.credits))
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
      `INSERT OR IGNORE INTO messages (id, chatId, role, text, lang, response_type, audio, audioCaption, image, fileName, caption, isReplied, mimeType)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [message.id, message.chatId, message.role, message.text, message.lang, message.response_type, message.audio, message.audioCaption, message.image, message.fileName, message.caption, message.isReplied, message.mimeType]
    );

    return result.changes ? true : false
  }



  async  getChatHistory(chatId: string) {
    const result = await this.db.all(
      `
        SELECT 
          JSON_GROUP_ARRAY(JSON_OBJECT('role', role, 'content', content, 'image', image, 'audio', audio ))
          FILTER (WHERE isReplied = 1) AS replied,
  
          JSON_GROUP_ARRAY(JSON_OBJECT('role', role, 'content', content, 'image', image, 'audio', audio )) 
          FILTER (WHERE isReplied = 0) AS notReplied
        FROM messages
        WHERE chatId = ?;
      `
      ,[chatId]
    );
    const replied = JSON.parse(result[0].replied || '[]')
    const notReplied = JSON.parse(result[0].notReplied || '[]')
    return { chatId, replied, notReplied, isFirstInteraction: !replied.length }
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



 async  upsertTranslation(id: string, lang: string, text: string){
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
