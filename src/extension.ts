// import * as vscode from "vscode";
// import * as https from "https";
// import fetch from "node-fetch";

// async function getApiKey() {
//   const config = vscode.workspace.getConfiguration("customAiChat");
//   let apiKey = config.get<string>("apiKey");

//   if (!apiKey) {
//     apiKey = await vscode.window.showInputBox({
//       prompt: "Please enter your OpenAI API key",
//       password: true,
//     });

//     if (apiKey) {
//       await config.update("apiKey", apiKey, true);
//     }
//   }

//   return apiKey;
// }

// export function activate(context: vscode.ExtensionContext) {
//   console.log('Extension "code-helper101" is now active!');

//   // Create custom HTTPS agent with SSL certificate handling
//   const httpsAgent = new https.Agent({
//     rejectUnauthorized: false,
//   });

//   let currentPanel: vscode.WebviewPanel | undefined = undefined;

//   let disposable = vscode.commands.registerCommand(
//     "code-helper101.startChat",
//     async () => {
//       // Debug logging for configuration
//       const config = vscode.workspace.getConfiguration("customAiChat");
//       const baseUrl = config.get<string>("baseUrl");
//       const apiKey = await getApiKey();

//       console.log("Base URL:", baseUrl);
//       console.log("API Key exists:", !!apiKey);

//       if (!baseUrl || !apiKey) {
//         vscode.window.showErrorMessage(
//           "Please configure base URL and API key in settings"
//         );
//         return;
//       }

//       if (currentPanel) {
//         currentPanel.reveal();
//         return;
//       }

//       currentPanel = vscode.window.createWebviewPanel(
//         "customAiChat",
//         "Custom AI Chat",
//         vscode.ViewColumn.Two,
//         {
//           enableScripts: true,
//         }
//       );

//       currentPanel.webview.html = getWebviewContent();

//       currentPanel.onDidDispose(
//         () => {
//           currentPanel = undefined;
//         },
//         null,
//         context.subscriptions
//       );

//       // Handle messages from the webview
//       currentPanel.webview.onDidReceiveMessage(
//         async (message) => {
//           switch (message.command) {
//             case "sendMessage":
//               try {
//                 console.log("Sending message:", message.text);

//                 const requestBody = {
//                   model: "gpt-3.5-turbo",
//                   messages: [{ role: "user", content: message.text }],
//                   temperature: 0.7,
//                   max_tokens: 1000,
//                 };

//                 console.log(
//                   "Request Body:",
//                   JSON.stringify(requestBody, null, 2)
//                 );

//                 const response = await fetch(`${baseUrl}/v1/chat/completions`, {
//                   method: "POST",
//                   agent: httpsAgent,
//                   headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${apiKey}`,
//                   },
//                   body: JSON.stringify(requestBody),
//                 });

//                 const data = await response.json();
//                 console.log("API Response:", JSON.stringify(data, null, 2));

//                 if (!response.ok) {
//                   throw new Error(
//                     `API Error: ${data.error?.message || "Unknown error"}`
//                   );
//                 }

//                 if (
//                   !data.choices ||
//                   !data.choices[0] ||
//                   !data.choices[0].message
//                 ) {
//                   throw new Error("Invalid response format from API");
//                 }

//                 currentPanel?.webview.postMessage({
//                   command: "receiveResponse",
//                   text: data.choices[0].message.content,
//                 });
//               } catch (error: any) {
//                 console.error("Full error:", error);
//                 vscode.window.showErrorMessage(`Error: ${error.message}`);

//                 currentPanel?.webview.postMessage({
//                   command: "receiveResponse",
//                   text: `Error: ${error.message}`,
//                 });
//               }
//               break;
//           }
//         },
//         undefined,
//         context.subscriptions
//       );
//     }
//   );

//   context.subscriptions.push(disposable);
// }

// function getWebviewContent() {
//   return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <style>
//                 body {
//                     margin: 0;
//                     padding: 10px;
//                     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
//                 }
//                 #chat-container {
//                     display: flex;
//                     flex-direction: column;
//                     height: 95vh;
//                     gap: 10px;
//                 }
//                 #messages {
//                     flex: 1;
//                     overflow-y: auto;
//                     margin-bottom: 10px;
//                     padding: 10px;
//                     border: 1px solid var(--vscode-input-border);
//                     border-radius: 4px;
//                 }
//                 .message {
//                     margin: 8px 0;
//                     padding: 12px;
//                     border-radius: 6px;
//                     max-width: 80%;
//                     word-wrap: break-word;
//                 }
//                 .user-message {
//                     background-color: var(--vscode-editor-background);
//                     border: 1px solid var(--vscode-input-border);
//                     margin-left: auto;
//                 }
//                 .ai-message {
//                     background-color: var(--vscode-editor-selectionBackground);
//                     color: var(--vscode-editor-foreground);
//                     margin-right: auto;
//                 }
//                 #input-container {
//                     display: flex;
//                     gap: 8px;
//                     padding: 10px;
//                     background-color: var(--vscode-editor-background);
//                     border-radius: 4px;
//                 }
//                 #message-input {
//                     flex: 1;
//                     padding: 8px;
//                     background-color: var(--vscode-input-background);
//                     color: var(--vscode-input-foreground);
//                     border: 1px solid var(--vscode-input-border);
//                     border-radius: 4px;
//                     font-size: 14px;
//                 }
//                 #message-input:focus {
//                     outline: none;
//                     border-color: var(--vscode-focusBorder);
//                 }
//                 button {
//                     padding: 8px 16px;
//                     background-color: var(--vscode-button-background);
//                     color: var(--vscode-button-foreground);
//                     border: none;
//                     border-radius: 4px;
//                     cursor: pointer;
//                     font-size: 14px;
//                 }
//                 button:hover {
//                     background-color: var(--vscode-button-hoverBackground);
//                 }
//                 .error-message {
//                     color: var(--vscode-errorForeground);
//                     background-color: var(--vscode-inputValidation-errorBackground);
//                     border: 1px solid var(--vscode-inputValidation-errorBorder);
//                 }
//             </style>
//         </head>
//         <body>
//             <div id="chat-container">
//                 <div id="messages"></div>
//                 <div id="input-container">
//                     <input type="text" id="message-input" placeholder="Type your message...">
//                     <button id="send-button">Send</button>
//                 </div>
//             </div>
//             <script>
//                 const vscode = acquireVsCodeApi();
//                 const messagesContainer = document.getElementById('messages');
//                 const messageInput = document.getElementById('message-input');
//                 const sendButton = document.getElementById('send-button');

//                 function addMessage(text, isUser = true, isError = false) {
//                     const messageDiv = document.createElement('div');
//                     messageDiv.className = \`message \${isUser ? 'user-message' : 'ai-message'} \${isError ? 'error-message' : ''}\`;
//                     messageDiv.textContent = text;
//                     messagesContainer.appendChild(messageDiv);
//                     messagesContainer.scrollTop = messagesContainer.scrollHeight;
//                 }

//                 function sendMessage() {
//                     const text = messageInput.value.trim();
//                     if (text) {
//                         addMessage(text, true);
//                         vscode.postMessage({
//                             command: 'sendMessage',
//                             text: text
//                         });
//                         messageInput.value = '';
//                     }
//                 }

//                 sendButton.addEventListener('click', sendMessage);
//                 messageInput.addEventListener('keypress', (e) => {
//                     if (e.key === 'Enter') {
//                         sendMessage();
//                     }
//                 });

//                 window.addEventListener('message', event => {
//                     const message = event.data;
//                     console.log('Received message:', message);

//                     switch (message.command) {
//                         case 'receiveResponse':
//                             if (message.text) {
//                                 const isError = message.text.startsWith('Error:');
//                                 addMessage(message.text, false, isError);
//                             } else {
//                                 addMessage('Received empty response from API', false, true);
//                             }
//                             break;
//                     }
//                 });

//                 // Focus input on load
//                 messageInput.focus();
//             </script>
//         </body>
//         </html>
//     `;
// }

// export function deactivate() {}

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
}

export function deactivate() {}
