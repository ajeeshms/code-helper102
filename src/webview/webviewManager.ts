import * as vscode from "vscode";
import { OpenAIAPI } from "../api/openai";
import { Settings } from "../config/settings";
import { getWebviewContent } from "./webviewContent";

export class WebviewManager {
  private panel?: vscode.WebviewPanel;

  constructor(private context: vscode.ExtensionContext) {}

  async show() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "customAiChat",
      "Custom AI Chat",
      vscode.ViewColumn.Two,
      { enableScripts: true }
    );

    this.panel.webview.html = getWebviewContent();
    this.updateModelDisplay();

    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
      },
      null,
      this.context.subscriptions
    );

    this.setupMessageHandling();
  }

  // private async updateModelDisplay() {
  //   const currentModel = await Settings.getCurrentModel();
  //   this.panel?.webview.postMessage({
  //     command: "updateModel",
  //     model: currentModel,
  //   });
  // }

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
              const response = await OpenAIAPI.sendMessage(message.text);
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
        }
      },
      undefined,
      this.context.subscriptions
    );
  }
}
