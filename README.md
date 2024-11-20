# Code Helper 101

A powerful VSCode extension that provides AI-powered code assistance similar to GitHub Copilot, but with enterprise-grade API support and custom certificate handling. Perfect for organizations requiring secure, self-hosted, or custom AI solutions.

## Features

- 🤖 AI-powered code completions and suggestions
- 🔒 Enterprise-grade API support with custom certificate handling
- 🔑 Configurable API headers for authentication
- 💻 Familiar interface similar to GitHub Copilot
- ⚡ Fast and responsive code assistance
- 🛡️ Secure communication with your chosen AI endpoints

## Installation

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Code Helper 101"
4. Click Install

## Configuration

Configure the extension in your VSCode settings:

```json
json
{
"codeHelper101.apiEndpoint": "https://your-api-endpoint.com",
"codeHelper101.apiKey": "your-api-key",
"codeHelper101.certificatePath": "/path/to/certificate.pem",
"codeHelper101.headers": {
"Authorization": "Bearer your-token",
"Custom-Header": "value"
}
}
```

### Required Settings

- `codeHelper101.apiEndpoint`: Your AI service endpoint
- `codeHelper101.apiKey`: API key for authentication

### Optional Settings

- `codeHelper101.certificatePath`: Path to custom SSL certificate
- `codeHelper101.headers`: Additional API headers
- `codeHelper101.enable`: Enable/disable the extension (default: true)
- `codeHelper101.suggestionDelay`: Delay before showing suggestions (default: 300ms)

## Usage

1. Start typing code in any file
2. The AI assistant will automatically provide suggestions
3. Accept suggestions using Tab or Enter
4. Trigger manual suggestions with Ctrl+Space (Cmd+Space on macOS)

## Known Issues

- Currently working on improving suggestion accuracy for certain programming languages
- Performance optimization for large files is in progress

## Release Notes

### 1.0.0

- Initial release
- Basic code completion functionality
- Enterprise API support
- Custom certificate handling

### 1.0.1

- Improved error handling
- Better API response parsing
- Fixed certificate validation issues

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Security

This extension supports enterprise-grade security features:

- Custom SSL certificate handling
- Secure API communication
- Configurable authentication headers

## Support

- 📫 Report issues on our [GitHub repository](https://github.com/sanjuhs/code-helper101/issues)
- 📝 Read our [documentation](https://github.com/sanjuhs/code-helper101/wiki)
- 💬 Join our [Discord community](https://discord.gg/your-invite-link)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Development

### Building from Source

```bash
git clone https://github.com/sanjuhs/code-helper101.git
cd code-helper101
npm install
npm run build
```

### Running Tests

```bash
npm run test
```

For more information, visit our [GitHub repository](https://github.com/sanjuhs/code-helper101).

**Enjoy coding with enterprise-grade AI assistance!**
