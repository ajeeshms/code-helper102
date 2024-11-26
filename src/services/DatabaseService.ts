import initSqlJs from "sql.js";
import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";

export interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: number;
  title: string;
  lastMessage: string;
  created_at: string;
  updated_at: string;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private db: any;
  private dbPath: string;
  private initialized = false;
  private context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this.dbPath = path.join(context.globalStorageUri.fsPath, "chats.db");
    this.context = context;
  }

  private async initializeDatabase() {
    if (this.initialized) return;

    try {
      console.log("Starting database initialization...");

      // Initialize with config
      const config = {
        locateFile: (filename: string) => {
          if (filename.endsWith(".wasm")) {
            return path.join(__dirname, filename);
          }
          return filename;
        },
        // Force node environment
        nodeEnvironment: true,
      };

      const SQL = await initSqlJs(config);

      if (!SQL || !SQL.Database) {
        throw new Error(
          "SQL.js initialization failed - Database constructor not available"
        );
      }

      console.log("SQL.js initialized successfully");

      // Create database directory if it doesn't exist
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      try {
        // Initialize database
        if (fs.existsSync(this.dbPath)) {
          console.log("Loading existing database");
          const data = fs.readFileSync(this.dbPath);
          this.db = new SQL.Database(data);
        } else {
          console.log("Creating new database");
          this.db = new SQL.Database();
          this.db.run(`
            CREATE TABLE IF NOT EXISTS chats (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              messages TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          this.saveToFile();
        }
        this.initialized = true;
        console.log("Database initialization complete");
      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        throw dbError;
      }
    } catch (error) {
      console.error("Database initialization failed:", error);
      if (error instanceof Error) {
        console.error("Full error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      // Don't throw, allow the extension to work without persistence
    }
  }

  private saveToFile() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  public async saveChat(messages: ChatMessage[]): Promise<void> {
    try {
      await this.initializeDatabase();
      if (!this.db) return;

      this.db.run("INSERT INTO chats (messages) VALUES (?)", [
        JSON.stringify(messages),
      ]);
      this.saveToFile();
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  }

  public async loadLatestChat(): Promise<ChatMessage[] | null> {
    try {
      await this.initializeDatabase();
      if (!this.db) {
        throw new Error("Database not initialized");
      }

      const result = this.db.exec(
        "SELECT messages FROM chats ORDER BY created_at DESC LIMIT 1"
      );
      if (result.length && result[0].values.length) {
        return JSON.parse(result[0].values[0][0]);
      }
      return null;
    } catch (error) {
      console.error("Error loading latest chat:", error);
      return null;
    }
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

  public async createChatSession(title: string): Promise<number> {
    await this.initializeDatabase();
    const result = this.db.run(
      "INSERT INTO chat_sessions (title, last_message) VALUES (?, ?)",
      [title, ""]
    );
    this.saveToFile();
    return result.lastID;
  }

  public async getChatSessions(): Promise<ChatSession[]> {
    await this.initializeDatabase();
    const result = this.db.exec(
      "SELECT id, title, last_message, created_at, updated_at FROM chat_sessions ORDER BY updated_at DESC"
    );
    if (!result.length) return [];
    return result[0].values.map((row: any) => ({
      id: row[0],
      title: row[1],
      lastMessage: row[2],
      created_at: row[3],
      updated_at: row[4],
    }));
  }

  public async loadChatSession(
    sessionId: number
  ): Promise<ChatMessage[] | null> {
    await this.initializeDatabase();
    const result = this.db.exec(
      "SELECT messages FROM chats WHERE session_id = ? ORDER BY created_at ASC",
      [sessionId]
    );
    if (result.length && result[0].values.length) {
      return JSON.parse(result[0].values[0][0]);
    }
    return null;
  }

  public async updateChatSession(
    sessionId: number,
    messages: ChatMessage[]
  ): Promise<void> {
    await this.initializeDatabase();
    const lastMessage =
      messages[messages.length - 1]?.content?.substring(0, 100) || "";
    this.db.run(
      "UPDATE chat_sessions SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [lastMessage, sessionId]
    );
    this.db.run("INSERT INTO chats (session_id, messages) VALUES (?, ?)", [
      sessionId,
      JSON.stringify(messages),
    ]);
    this.saveToFile();
  }
}
