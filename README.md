# Directus OpenAI Interactor Extension

A modern Directus extension that leverages OpenAI's cutting-edge **Responses API** for enhanced AI operations with intelligent parameter management. This extension provides context-aware UI components that show only relevant parameters for each operation type, eliminating clutter and improving user experience.

## 🚀 What's New in Version 1.1

### Migrated to OpenAI Responses API
- **Modern API Integration**: Now uses OpenAI's latest Responses API instead of deprecated Chat Completions
- **Enhanced Capabilities**: Built-in tools for web search, file search, and code interpretation
- **Better State Management**: Server-side conversation state management with response IDs
- **Improved Performance**: Reduced latency and better token efficiency

### Smart Parameter Visibility
- **Context-Aware UI**: Parameters automatically show/hide based on selected operation type
- **Reduced Complexity**: No more overwhelming forms with irrelevant options
- **Improved UX**: Cleaner, more focused interface for each operation

## Features

### Supported OpenAI Operations

- **Text Generation** - Modern chat and text completion using Responses API
- **Image Generation** - Create images with DALL-E using built-in image generation tool
- **Web Search** - Real-time web search capabilities integrated directly into AI responses
- **File Search** - Search through uploaded documents using vector store integration
- **Code Interpreter** - Execute code and perform data analysis with AI assistance
- **Text Embeddings** - Generate vector embeddings for semantic search
- **Content Moderation** - Check content for policy violations
- **List Models** - Get available OpenAI models

### Intelligent UI Components

- **Smart Dropdowns** for model selection, operation types, image settings
- **Contextual Sliders** for temperature, top_p, penalties (only for text generation)
- **Dynamic Fields** that appear only when relevant to selected operation
- **Rich Text Areas** for prompts, messages, and code input
- **JSON Editors** for vector store IDs and structured data
- **Conversation Continuity** with previous response ID support

### Advanced Features

- **Contextual Parameter Display** - Fields appear only for relevant operations
- **Conversation State Management** - Continue conversations using response IDs
- **Built-in Tool Integration** - Web search, file search, and code execution
- **Error Handling** - Comprehensive error messages and logging
- **Type Safety** - Full TypeScript support with strict typing
- **Response Storage** - Option to store responses for conversation continuity

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Extension**
   ```bash
   npm run build
   ```

3. **Link to Directus** (for development)
   ```bash
   npm run link
   ```

4. **Deploy to Directus**
   Copy the `dist` folder to your Directus extensions directory:
   ```
   directus/extensions/operations/openai-interactor/
   ```

## Usage

### 1. Basic Setup

1. Add the **OpenAI Interactor** operation to your Directus flow
2. Enter your OpenAI API key (required)
3. Select the operation type - the UI will automatically show relevant parameters
4. Configure parameters using the contextual UI components

### 2. Operation Types & Parameters

#### Text Generation
**Visible Parameters:**
- Model selection (GPT-4o, GPT-4o Mini, etc.)
- System message (optional)
- User message (required)
- Generation parameters (temperature, max tokens, top_p, penalties)
- Previous response ID for conversation continuity

#### Image Generation
**Visible Parameters:**
- Model selection (DALL-E models automatically chosen)
- Image description prompt (required)
- Image size, quality, and style options
- Previous response ID for iterative generation

#### Web Search
**Visible Parameters:**
- Model selection
- Search query (required)
- Previous response ID for context-aware searches

#### File Search
**Visible Parameters:**
- Model selection
- Search query (required)
- Vector store IDs (JSON array, required)
- Previous response ID for continued searches

#### Code Interpreter
**Visible Parameters:**
- Model selection
- Code or analysis request (required)
- Previous response ID for multi-step analysis

### 3. Response Handling

The extension returns enhanced responses with conversation state:

```typescript
// Success Response
{
  success: true,
  data: {
    content: "AI response...",
    model: "gpt-4o-mini",
    usage: { /* token usage */ },
    finish_reason: "completed"
  },
  response_id: "resp_abc123..." // For conversation continuity
}

// Error Response
{
  success: false,
  error: {
    message: "Error description",
    type: "ErrorType",
    operation_type: "text_generation",
    model: "gpt-4o-mini"
  }
}
```

## Configuration Benefits

### Smart Parameter Management
- **Text Generation**: Only shows text-related parameters (temperature, tokens, penalties)
- **Image Generation**: Only shows image-specific options (size, quality, style)
- **Search Operations**: Focus on search query and vector stores
- **Code Interpreter**: Streamlined for code and data analysis requests

### Conversation Continuity
- Use `response_id` from previous calls to maintain conversation context
- Server-side state management eliminates need to resend full conversation history
- Improved performance and reduced token usage

## Supported Models

### Text Generation Models
- GPT-4o
- GPT-4o Mini  
- GPT-4 Turbo
- GPT-4
- GPT-3.5 Turbo

### Image Generation Models
- DALL-E 3 (recommended)
- DALL-E 2

### Embedding Models
- Text Embedding 3 Large
- Text Embedding 3 Small
- Text Embedding Ada 002

## Migration from v1.0

If you're upgrading from the previous version:

1. **Operation Types Changed**:
   - `chat_completion` → `text_generation`
   - `completion` → `text_generation` 
   - Audio operations removed (use dedicated audio extensions)

2. **Parameter Names Updated**:
   - `message` → `user_message`
   - `max_tokens` → `max_output_tokens`
   - New: `previous_response_id`, `search_query`, `vector_store_ids`, `code_input`

3. **Enhanced Features**:
   - Built-in web search, file search, and code interpretation
   - Conversation state management
   - Context-aware parameter display

## Security & Best Practices

- **API Key Security**: Store your OpenAI API key securely in Directus environment
- **Vector Store Management**: Use proper vector store IDs for file search operations
- **Response Storage**: Enable response storage for conversation continuity
- **Cost Optimization**: Monitor token usage with the new efficient Responses API

## Development

### Build for Development
```bash
npm run dev
```

### Validate Extension
```bash
npm run validate
```

## License

MIT License - feel free to customize and extend for your needs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the Directus documentation
2. Review OpenAI API documentation
3. Open an issue in this repository 