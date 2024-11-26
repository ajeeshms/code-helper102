import initSqlJs from "sql.js";
import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";

export interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private db: any;
  private dbPath: string;
  private initialized = false;

  private constructor(context: vscode.ExtensionContext) {
    this.dbPath = path.join(context.globalStorageUri.fsPath, "chats.db");
  }

  private async initializeDatabase() {
    if (this.initialized) return;

    const SQL = await initSqlJs();

    if (fs.existsSync(this.dbPath)) {
      const data = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(data);
    } else {
      this.db = new SQL.Database();
      this.db.run(`
        CREATE TABLE IF NOT EXISTS chats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          messages TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    this.initialized = true;
  }

  private saveToFile() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  public async saveChat(messages: ChatMessage[]): Promise<void> {
    await this.initializeDatabase();
    this.db.run("INSERT INTO chats (messages) VALUES (?)", [
      JSON.stringify(messages),
    ]);
    this.saveToFile();
  }

  public async loadLatestChat(): Promise<ChatMessage[] | null> {
    await this.initializeDatabase();
    const result = this.db.exec(
      "SELECT messages FROM chats ORDER BY created_at DESC LIMIT 1"
    );
    if (result.length && result[0].values.length) {
      return JSON.parse(result[0].values[0][0]);
    }
    return null;
  }

  public getAllChats(): { id: number; messages: ChatMessage[] }[] {
    const result = this.db.exec(
      "SELECT id, messages FROM chats ORDER BY created_at DESC"
    );
    if (!result.length) return [];

    return result[0].values.map((row: any) => ({
      id: row[0],
      messages: JSON.parse(row[1]),
    }));
  }

  public static async getInstance(
    context?: vscode.ExtensionContext
  ): Promise<DatabaseService> {
    if (!DatabaseService.instance && context) {
      DatabaseService.instance = new DatabaseService(context);
      await DatabaseService.instance.initializeDatabase();
    }
    return DatabaseService.instance;
  }
}
