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
    try {
      this.panel = vscode.window.createWebviewPanel(
        ChatHistoryView.viewType,
        "Chat History",
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      const sessions = await this.dbService.getChatSessions();
      this.panel.webview.html = this.getHistoryWebviewContent(sessions);

      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });

      this.panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === "openChat") {
          const sessionId = parseInt(message.sessionId, 10);
          console.log(
            "[ChatHistoryView] Opening chat with sessionId:",
            sessionId
          );
          if (!isNaN(sessionId)) {
            await vscode.commands.executeCommand(
              "code-helper101.startChat",
              sessionId
            );
            this.panel?.dispose();
          } else {
            console.error(
              "[ChatHistoryView] Invalid sessionId:",
              message.sessionId
            );
          }
        }
      });
    } catch (error) {
      console.error("Error showing chat history:", error);
      vscode.window.showErrorMessage("Failed to show chat history");
    }
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
              <div class="chat-title">${
                session.title ||
                "Chat from " + new Date(session.created_at).toLocaleString()
              }</div>
              <div class="chat-preview">${
                session.lastMessage || "No messages"
              }</div>
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
              console.log('Opening chat:', sessionId);
              vscode.postMessage({ 
                command: 'openChat', 
                sessionId: sessionId 
              });
            }
          </script>
        </body>
      </html>
    `;
  }
}
