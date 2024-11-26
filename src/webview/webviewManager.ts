import * as vscode from "vscode";
import { OpenAIAPI } from "../api/openai";
import { Settings } from "../config/settings";
import { getWebviewContent } from "./webviewContent";
import { DatabaseService } from "../services/DatabaseService";

export class WebviewManager {
  private panel?: vscode.WebviewPanel;
  // private contextFiles: Set<string> = new Set();
  private contextFiles: Map<string, string> = new Map();

  private static instance: WebviewManager;
  private dbService!: DatabaseService;

  constructor(private context: vscode.ExtensionContext) {
    this.initialize();
    WebviewManager.instance = this;
  }

  private async initialize() {
    this.dbService = await DatabaseService.getInstance(this.context);
  }

  static getInstance(): WebviewManager | undefined {
    return WebviewManager.instance;
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

  async show() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "customAiChat",
      "Custom AI Chat",
      vscode.ViewColumn.Two,
      { enableScripts: true, retainContextWhenHidden: true }
    );

    this.panel.webview.html = getWebviewContent();
    await this.updateModelDisplay();

    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
      },
      null,
      this.context.subscriptions
    );

    this.setupMessageHandling();

    const previousChat = await this.dbService.loadLatestChat();
    if (previousChat) {
      this.panel?.webview.postMessage({
        type: "loadPreviousChat",
        messages: previousChat,
      });
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
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  public async saveChatMessages(messages: any[]) {
    this.dbService.saveChat(messages);
  }
}
