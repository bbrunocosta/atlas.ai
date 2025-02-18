import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import * as dotenv from 'dotenv'

dotenv.config()

const db = await open({
  filename: './chat_history.db',
  driver: sqlite3.Database
});


await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    messageId TEXT,
    chatId TEXT,
    content TEXT,
    image TEXT,
    audio TEXT,
    mimeType TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    role TEXT CHECK(role IN ('user', 'assistant')), 
    isReplied INTEGER DEFAULT 0
  );
`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS usage (
    chatId TEXT PRIMARY KEY,
    credits REAL NOT NULL DEFAULT 1000
  );
`);


export async function getCredits(chatId) {
  const result = await db.get(
    `SELECT credits FROM usage
     WHERE chatId = ?`,
    [chatId]
  );
  console.log(Math.trunc(result?.credits))
  return Math.trunc(result?.credits);
}

export async function upsertCredits(chatId, amountSpent, isRecharge = false) {
  const result = await db.get(
    `INSERT INTO usage (chatId)
     VALUES (?)
     ON CONFLICT(chatId) DO UPDATE 
     SET credits = credits ${ isRecharge ? '+' : '-' } ?
     RETURNING credits`,
    [chatId, amountSpent]
  );
  
  return result;
}



export async function saveMessage({messageId, chatId, content, role, isReplied, image, mimeType, audio}) { 
  
  const result = await db.run(
    `INSERT INTO messages (messageId, chatId, content, role, isReplied, image, mimeType, audio)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?
     WHERE NOT EXISTS (SELECT 1 FROM messages WHERE messageId = ?)`,
    [messageId, chatId, content, role, isReplied, image, mimeType, audio, messageId]
  );

  return result.changes > 0
}



export async function getChatHistory(chatId) {
  const result = await db.all(
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



export async function getLastMessage(chatId) {
  const result = await db.all(
    `SELECT * FROM messages 
     WHERE chatId = ?
     ORDER BY timestamp DESC
     LIMIT 1`
    ,[chatId]
  );
  return result[0];
}

export async function markMessagesAsReplied(chatId) {
  await db.run(
    `UPDATE messages 
     SET isReplied = 1 
     WHERE isReplied = 0 AND chatId = ? `,
     [chatId]
  );
}




await db.exec(`
  CREATE TABLE IF NOT EXISTS translations(
    lang TEXT,
    id TEXT,
    text TEXT,
    PRIMARY KEY (lang, id)
  );
`);

export async function getTranslation(id, lang){
  const result = await db.get(
    `SELECT text FROM translations WHERE id = ? AND lang = ?`,
    [id, lang]
  );
  return result?.text
}


export async function upsertTranslation(id, lang, text){
  const result = await db.get(
    `INSERT INTO translations (id, lang, text) 
    VALUES (?, ?, ?)
    ON CONFLICT(id,lang) DO UPDATE 
    SET text = excluded.text
    RETURNING text`,
    [id, lang, text]
  );
  return result?.text
}

