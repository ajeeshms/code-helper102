# code-helper101 README

This is the README for your extension "code-helper101". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: Enable/disable this extension.
- `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**

some extra config

```json
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
```

old packeg.json:

```json
{
  "name": "code-helper101",
  "displayName": "code-helper101",
  "description": "used to help you get a code chat similar to github copilott   with  enterprise grade apisand certifications",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.95.0"
  },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "code-helper101.startChat",
        "title": "Start Custom AI Chat"
      }
    ],
    "configuration": {
      "title": "Custom AI Chat",
      "properties": {
        "customAiChat.baseUrl": {
          "type": "string",
          "default": "",
          "description": "Custom OpenAI API base URL"
        },
        "customAiChat.apiKey": {
          "type": "string",
          "default": "",
          "description": "Custom OpenAI API key"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run package",
    "compile": "webpack",
    "watch": "webpack --watch",
    "package": "webpack --mode production --devtool hidden-source-map",
    "compile-tests": "tsc -p . --outDir out",
    "watch-tests": "tsc -p . -w --outDir out",
    "pretest": "npm run compile-tests && npm run compile && npm run lint",
    "lint": "eslint src",
    "test": "vscode-test"
  },
  "dependencies": {
    "https": "^1.0.0",
    "node-fetch": "^2.7.0"
  },
  "devDependencies": {
    "@types/mocha": "^10.0.9",
    "@types/node": "20.x",
    "@types/node-fetch": "^2.6.1",
    "@types/vscode": "^1.95.0",
    "@typescript-eslint/eslint-plugin": "^8.10.0",
    "@typescript-eslint/parser": "^8.7.0",
    "@vscode/test-cli": "^0.0.10",
    "@vscode/test-electron": "^2.4.1",
    "eslint": "^9.13.0",
    "ts-loader": "^9.5.1",
    "typescript": "^5.6.3",
    "webpack": "^5.95.0",
    "webpack-cli": "^5.1.4"
  }
}
```

```python
import pip_system_certs.wrapt_requests

import requests

#If you are using the openai module, you'll need do this:

import ssl, httpx

ssl_context = ssl.create_default_context()
ssl_context.load_default_certs()
httpx_client = httpx.Client(verify=ssl_context)

from openai import OpenAI

client =  OpenAI(
base_url = "https://llm-proxy-api.ai.openeng.netapp.com",
api_key ="somekey",
http_client = httpx_client
)

completion = client.chat.completions.create(
model = "gpt-35-turbo",
messages = [ {"role" : "user", "content": "Write a function that prints"}],
user ="someuser"
)
```
