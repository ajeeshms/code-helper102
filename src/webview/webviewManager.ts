import * as vscode from "vscode";
import { OpenAIAPI } from "../api/openai";
import { Settings } from "../config/settings";
import { getWebviewContent } from "./webviewContent";
import { DatabaseService } from "../services/DatabaseService";

export class WebviewManager {
  private static instance: WebviewManager;
  private dbService!: DatabaseService;
  private currentSessionId?: number;
  private panel?: vscode.WebviewPanel;
  private contextFiles: Map<string, string> = new Map();

  constructor(private context: vscode.ExtensionContext) {
    WebviewManager.instance = this;
  }

  static getInstance(): WebviewManager | undefined {
    return WebviewManager.instance;
  }

  async show(sessionId?: number) {
    try {
      // Initialize database first
      this.dbService = await DatabaseService.getInstance(this.context);

      // Create panel first
      if (!this.panel) {
        this.panel = vscode.window.createWebviewPanel(
          "customAiChat",
          "Custom AI Chat",
          vscode.ViewColumn.Two,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
          }
        );

        this.panel.onDidDispose(() => {
          this.panel = undefined;
        });

        this.panel.webview.html = getWebviewContent();
        this.setupMessageHandling();
      } else {
        this.panel.reveal();
      }

      // Handle session after panel is created
      if (!sessionId) {
        const title = new Date().toLocaleString();
        this.currentSessionId = await this.dbService.createChatSession(title);
      } else {
        this.currentSessionId = sessionId;
        const chatMessages = await this.dbService.loadChatSession(sessionId);
        if (chatMessages) {
          this.panel.webview.postMessage({
            type: "loadPreviousChat",
            messages: chatMessages,
          });
        }
      }

      await this.updateModelDisplay();
    } catch (error) {
      console.error("Error showing webview:", error);
      vscode.window.showErrorMessage(
        `Failed to initialize chat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async updateModelDisplay() {
    const currentModel = await Settings.getCurrentModel();
    if (this.panel) {
      this.panel.webview.postMessage({
        command: "updateModel",
        model: currentModel,
      });
    }
  }

  private setupMessageHandling() {
    this.panel?.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "newChat":
            this.panel?.webview.postMessage({
              command: "clearChat",
            });
            break;

          case "sendMessage":
            try {
              const response = await OpenAIAPI.sendMessage(
                message.text,
                this.contextFiles
              );
              this.panel?.webview.postMessage({
                command: "receiveResponse",
                text: response,
              });
            } catch (error: any) {
              vscode.window.showErrorMessage(`Error: ${error.message}`);
              this.panel?.webview.postMessage({
                command: "receiveResponse",
                text: `Error: ${error.message}`,
              });
            }
            break;

          case "changeModel":
            const newModel = await Settings.selectModel();
            if (newModel) {
              this.updateModelDisplay();
            }
            break;
          case "removeFromContext":
            this.contextFiles.delete(message.file);
            this.panel?.webview.postMessage({
              command: "updateContext",
              files: Array.from(this.contextFiles.keys()),
            });
            break;
          case "clearContext":
            this.contextFiles.clear();
            this.panel?.webview.postMessage({
              command: "updateContext",
              files: [],
            });
            break;
          case "saveChat":
            if (this.currentSessionId) {
              await this.dbService.updateChatSession(
                this.currentSessionId,
                message.messages
              );
            }
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  public async saveChatMessages(messages: any[]) {
    this.dbService.saveChat(messages);
  }

  async addToContext(uri: vscode.Uri) {
    const relativePath = vscode.workspace.asRelativePath(uri);
    const fileContent = await vscode.workspace.fs.readFile(uri);
    const contentText = Buffer.from(fileContent).toString("utf8");

    this.contextFiles.set(relativePath, contentText);

    this.panel?.webview.postMessage({
      command: "updateContext",
      files: Array.from(this.contextFiles.keys()),
    });
  }
}
