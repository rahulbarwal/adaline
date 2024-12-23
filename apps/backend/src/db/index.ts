import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(__dirname, "database.sqlite"));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    order_num INTEGER NOT NULL,
    type TEXT DEFAULT 'folder',
    icon TEXT DEFAULT 'folder',
    is_open BOOLEAN DEFAULT true
  );

  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    folder_id TEXT DEFAULT '0',
    title TEXT NOT NULL,
    order_num INTEGER NOT NULL,
    type TEXT DEFAULT 'file',
    icon TEXT DEFAULT 'file',
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
  );

  INSERT OR IGNORE INTO folders (id, title, order_num, type, icon)
  VALUES ('0', 'Root', 0, 'folder', 'folder');
`);

export default db;
