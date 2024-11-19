export function getWebviewContent() {
  return `
        <!DOCTYPE html>
        <html>
                <head>
            <style>
                body {
                    margin: 0;
                    padding: 10px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                }
                #chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 95vh;
                    gap: 10px;
                }
                #messages {
                    flex: 1;
                    overflow-y: auto;
                    margin-bottom: 10px;
                    padding: 6px;
                    /*
                    // border: 1px solid var(--vscode-input-border);
                    // border-radius: 4px;
                    */
                }
                .message {
                    margin: 8px 0;
                    padding: 12px;
                    border-radius: 6px;
                    width: 96%;
                    word-wrap: break-word;
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-input-border);
                }
                .user-message {
                    /*
                    // background-color: var(--vscode-editor-background);
                    // border: 1px solid var(--vscode-input-border);
                    // margin-left: auto;
                    */
                }
                .ai-message {
                    /*
                    // background-color: var(--vscode-editor-selectionBackground);
                    // color: var(--vscode-editor-foreground);
                    // margin-right: auto;
                    */
                }

                .message-container {
                    position: relative;
                    margin: 8px 0;
                }

                .copy-button {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    padding: 4px 8px;
                    font-size: 10px;
                    opacity: 0.7;
                }

                .copy-button:hover {
                    opacity: 1;
                }


                #input-container {
                    display: flex;
                    gap: 8px;
                    padding: 10px;
                    background-color: var(--vscode-editor-background);
                    border-radius: 4px;
                    align-items: flex-start; // Add this to align button with top of textarea
                }

                #message-input {
                    flex: 1;
                    padding: 8px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    font-size: 10px;
                    resize: none; // Prevents manual resizing
                    min-height: 40px;
                    max-height: 200px; // Approximately 10 lines
                    font-family: Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                }
                #message-input:focus {
                    outline: none;
                    border-color: var(--vscode-focusBorder);
                }
                button {
                    padding: 8px 16px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .error-message {
                    color: var(--vscode-errorForeground);
                    background-color: var(--vscode-inputValidation-errorBackground);
                    border: 1px solid var(--vscode-inputValidation-errorBorder);
                }
                
                .model-selector {
                    margin-bottom: 10px;
                    padding: 8px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    width: 200px;
                }
                .toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    font-size: 12px;
                }

                @keyframes flash {
                    0% { opacity: 0.5; }
                    100% { opacity: 1; }
                }

                .context-files {
                    margin: 8px 0;
                    padding: 8px;
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    font-size: 12px;
                }

                .context-file {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 4px;
                }

                .context-file button {
                    padding: 2px 6px;
                    font-size: 10px;
                }

                #model-display {
                    padding: 4px 8px;
                    font-size: 10px;
                    border-radius: 4px;
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-input-border);
                }

                #change-model {
                    padding: 4px 8px;
                    font-size: 10px;
                    border-radius: 4px;                
                }

                .loading-message {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 8px 0;
                    padding: 12px;
                    border-radius: 6px;
                    width: 100%;
                    background-color: var(--vscode-editor-selectionBackground);
                    color: var(--vscode-editor-foreground);
                    margin-right: auto;
                }

                @keyframes bounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-5px); }
                }

                .loading-dots {
                    display: flex;
                    gap: 4px;
                }

                .dot {
                    width: 6px;
                    height: 6px;
                    background-color: var(--vscode-editor-foreground);
                    border-radius: 50%;
                }

                .dot:nth-child(1) { animation: bounce 1.4s infinite 0s; }
                .dot:nth-child(2) { animation: bounce 1.4s infinite 0.2s; }
                .dot:nth-child(3) { animation: bounce 1.4s infinite 0.4s; }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/default.min.css">
            <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js"></script>
        </head>



        
<body>
    <div id="chat-container">
        <div class="toolbar">
            <button id="change-model">Change Model</button>
            <span id="model-display">Current Model: <span id="current-model"></span></span>
        </div>
        <div id="context-files" class="context-files" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span>Context Files:</span>
                <button id="clear-context" style="font-size: 10px;">Clear All</button>
            </div>
            <div id="context-files-list"></div>
        </div>
        <div id="messages"></div>
        <div id="input-container">
            <textarea 
                id="message-input" 
                placeholder="Type your message... (Shift+Enter for new line)"
                rows="3"
            ></textarea>
            <button id="send-button">Send</button>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messages');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const changeModelButton = document.getElementById('change-model');
        const currentModelSpan = document.getElementById('current-model');

        // Add the message handling function

        // function addMessage(text, isUser = true, isError = false) {
        //     const messageDiv = document.createElement('div');
        //     messageDiv.className = \`message \${isUser ? 'user-message' : 'ai-message'} \${isError ? 'error-message' : ''}\`;
            
        //     if (isUser) {
        //         messageDiv.textContent = text;
        //     } else {
        //         // Parse markdown for AI responses
        //         messageDiv.innerHTML = marked.parse(text);
        //         // Apply syntax highlighting to code blocks
        //         messageDiv.querySelectorAll('pre code').forEach((block) => {
        //             hljs.highlightBlock(block);
        //         });
        //     }
        //     messagesContainer.appendChild(messageDiv);
        //     messagesContainer.scrollTop = messagesContainer.scrollHeight;
        // }


        // Update the addMessage function in the <script> section
        function addMessage(text, isUser = true, isError = false) {
            const messageContainer = document.createElement('div');
            messageContainer.className = 'message-container';

            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${isUser ? 'user-message' : 'ai-message'} \${isError ? 'error-message' : ''}\`;
            
            if (isUser) {
                messageDiv.textContent = text;
            } else {
                // Parse markdown for AI responses
                messageDiv.innerHTML = marked.parse(text);
                // Apply syntax highlighting to code blocks
                messageDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });

                // Add copy button for AI messages
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-button';
                copyButton.textContent = 'Copy';
                copyButton.onclick = () => {
                    navigator.clipboard.writeText(text)
                        .then(() => {
                            copyButton.textContent = 'Copied!';
                            setTimeout(() => {
                                copyButton.textContent = 'Copy';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Failed to copy:', err);
                            copyButton.textContent = 'Failed';
                        });
                };
                messageContainer.appendChild(copyButton);
            }
            
            messageContainer.appendChild(messageDiv);
            messagesContainer.appendChild(messageContainer);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }



        // Add these functions in your JavaScript section
        function addLoadingIndicator() {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-message';
            loadingDiv.id = 'loading-indicator';
            
            loadingDiv.innerHTML = \`
                Thinking
                <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            \`;
            
            messagesContainer.appendChild(loadingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function removeLoadingIndicator() {
            const loadingDiv = document.getElementById('loading-indicator');
            if (loadingDiv) {
                loadingDiv.remove();
            }
        }

        function updateContextFiles(files) {
            const contextFiles = document.getElementById('context-files');
            const filesList = document.getElementById('context-files-list');
            
            if (files.length === 0) {
                contextFiles.style.display = 'none';
                return;
            }
            
            contextFiles.style.display = 'block';
            filesList.innerHTML = files.map(file => \`
                <div class="context-file">
                    <span>\${file}</span>
                    <button onclick="removeFromContext('\${file}')">Remove</button>
                </div>
            \`).join('');
        }

        function removeFromContext(file) {
            vscode.postMessage({
                command: 'removeFromContext',
                file: file
            });
        }


        // Add the message sending function
        function sendMessage() {
            const text = messageInput.value.trim();
            if (text) {
                addMessage(text, true);
                addLoadingIndicator();
                vscode.postMessage({
                    command: 'sendMessage',
                    text: text
                });
                messageInput.value = '';
            }
        }

        // Add event listeners
        changeModelButton.addEventListener('click', () => {
            vscode.postMessage({
                command: 'changeModel'
            });
        });

        sendButton.addEventListener('click', sendMessage);
        // Update the keypress event listener in the JavaScript section
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    // Allow the default behavior for Shift+Enter (new line)
                    return;
                } else {
                    e.preventDefault(); // Prevent default to avoid unwanted newline
                    sendMessage();
                }
            }
        });

        window.addEventListener('message', event => {
            const message = event.data;
            console.log('Received message:', message);
            
            switch (message.command) {
                case 'receiveResponse':
                    removeLoadingIndicator();
                    if (message.text) {
                        const isError = message.text.startsWith('Error:');
                        addMessage(message.text, false, isError);
                    } else {
                        addMessage('Received empty response from API', false, true);
                    }
                    break;

                case 'updateModel':
                    if (message.model) {
                            currentModelSpan.textContent = message.model;
                            // Add a visual feedback for model change
                            const modelDisplay = document.getElementById('model-display');
                            modelDisplay.style.animation = 'none';
                            modelDisplay.offsetHeight; // Trigger reflow
                            modelDisplay.style.animation = 'flash 0.5s';
                    }
                    break;

                case 'updateContext':
                    updateContextFiles(message.files);
                    break;
            }
        });

        // Add this JavaScript right after your existing event listeners
        messageInput.addEventListener('input', function() {
            // Reset height to auto to get the correct scrollHeight
            this.style.height = 'auto';
            
            // Set new height based on content
            const newHeight = Math.min(this.scrollHeight, 200); // 200px is max height
            this.style.height = newHeight + 'px';
        });

        // Focus input on load
        messageInput.focus();
    </script>
</body>


        </html>
    `;
}
