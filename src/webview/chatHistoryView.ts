import * as vscode from "vscode";
import { DatabaseService, ChatSession } from "../services/DatabaseService";

export class ChatHistoryView {
  private static readonly viewType = "chatHistory";
  private panel: vscode.WebviewPanel | undefined;
  private dbService!: DatabaseService;

  constructor(private context: vscode.ExtensionContext) {
    this.initialize();
  }

  private async initialize() {
    this.dbService = await DatabaseService.getInstance(this.context);
  }

  public async show() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      ChatHistoryView.viewType,
      "Chat History",
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    const sessions = await this.dbService.getChatSessions();
    this.panel.webview.html = this.getHistoryWebviewContent(sessions);

    this.panel.webview.onDidReceiveMessage(async (message) => {
      if (message.command === "openChat") {
        await vscode.commands.executeCommand(
          "code-helper101.startChat",
          message.sessionId
        );
      }
    });
  }

  private getHistoryWebviewContent(sessions: ChatSession[]): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .chat-session {
              padding: 10px;
              margin: 5px;
              border: 1px solid var(--vscode-input-border);
              cursor: pointer;
            }
            .chat-title {
              font-weight: bold;
            }
            .chat-preview {
              color: var(--vscode-descriptionForeground);
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          ${sessions
            .map(
              (session) => `
            <div class="chat-session" onclick="openChat(${session.id})">
              <div class="chat-title">${session.title}</div>
              <div class="chat-preview">${session.lastMessage}</div>
              <div class="chat-date">${new Date(
                session.updated_at
              ).toLocaleString()}</div>
            </div>
          `
            )
            .join("")}
          <script>
            const vscode = acquireVsCodeApi();
            function openChat(sessionId) {
              vscode.postMessage({ command: 'openChat', sessionId });
            }
          </script>
        </body>
      </html>
    `;
  }
}
