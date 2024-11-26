import * as vscode from "vscode";
import { WebviewManager } from "./webview/webviewManager";
import { DatabaseService } from "./services/DatabaseService";
import { ChatHistoryView } from "./webview/chatHistoryView";

export async function activate(context: vscode.ExtensionContext) {
  try {
    console.log('Extension "code-helper101" is now active!');

    // Initialize database service first
    await DatabaseService.getInstance(context);

    const webviewManager = new WebviewManager(context);
    const chatHistoryView = new ChatHistoryView(context);

    // Register commands
    let disposable = vscode.commands.registerCommand(
      "code-helper101.startChat",
      async () => {
        await webviewManager.show();
      }
    );

    let historyDisposable = vscode.commands.registerCommand(
      "code-helper101.showChatHistory",
      async () => {
        await chatHistoryView.show();
      }
    );

    context.subscriptions.push(disposable, historyDisposable);

    // Replace the addToContext command registration
    let addToContextDisposable = vscode.commands.registerCommand(
      "code-helper101.addToContext",
      async (uri: vscode.Uri) => {
        const manager = WebviewManager.getInstance();
        if (!manager) {
          // If chat isn't open, inform the user
          vscode.window.showInformationMessage(
            "Please open the chat window first"
          );
          return;
        }

        if (!uri) {
          // If no URI provided, show file picker
          const files = await vscode.window.showOpenDialog({
            canSelectMany: true,
            openLabel: "Add to Context",
          });
          if (files) {
            for (const file of files) {
              await manager.addToContext(file);
            }
          }
        } else {
          await manager.addToContext(uri);
        }
      }
    );

    context.subscriptions.push(addToContextDisposable);
  } catch (error) {
    console.error("Extension activation failed:", error);
    throw error;
  }
}

export function deactivate() {}
