import sqlite3 from 'sqlite3';
export default {
  filename: "./chat_history.db",
  driver: sqlite3.Database,
}