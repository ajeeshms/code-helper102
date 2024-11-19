import * as vscode from "vscode";
import { WebviewManager } from "./webview/webviewManager";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "code-helper101" is now active!');

  const webviewManager = new WebviewManager(context);

  let disposable = vscode.commands.registerCommand(
    "code-helper101.startChat",
    async () => {
      await webviewManager.show();
    }
  );

  context.subscriptions.push(disposable);

  // let addToContextDisposable = vscode.commands.registerCommand(
  //   "code-helper101.addToContext",
  //   async (uri: vscode.Uri) => {
  //     if (!webviewManager) {
  //       // If chat isn't open, inform the user
  //       vscode.window.showInformationMessage(
  //         "Please open the chat window first"
  //       );
  //       return;
  //     }
  //     if (!uri) {
  //       // If no URI provided, show file picker
  //       const files = await vscode.window.showOpenDialog({
  //         canSelectMany: true,
  //         openLabel: "Add to Context",
  //       });
  //       if (files) {
  //         for (const file of files) {
  //           await webviewManager.addToContext(file);
  //         }
  //       }
  //     } else {
  //       await webviewManager.addToContext(uri);
  //     }
  //   }
  // );

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
}

export function deactivate() {}
