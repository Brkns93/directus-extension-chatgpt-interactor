# Directus ChatGPT Interactor Extension

A comprehensive Directus extension that provides all the latest ChatGPT core endpoints with component-based parameter inputs. Instead of entering values as JSON format, this extension provides intuitive UI components like dropdowns, sliders, and radio buttons.

## Features

### Supported OpenAI Operations

- **Chat Completion** - Interactive conversations with GPT models
- **Text Completion** - Traditional text completion
- **Image Generation** - Create images with DALL-E models
- **Audio Transcription** - Convert audio to text with Whisper
- **Audio Translation** - Translate audio to English
- **Text Embeddings** - Generate vector embeddings
- **Content Moderation** - Check content for policy violations
- **List Models** - Get available OpenAI models

### Component-Based Inputs

- **Dropdowns** for model selection, operation types, image sizes, etc.
- **Sliders** for temperature, top_p, frequency penalty, presence penalty
- **Toggle switches** for streaming, response storage
- **Text areas** for prompts, messages, and descriptions
- **File uploads** for audio transcription/translation
- **Input fields** with validation and placeholders

### Advanced Features

- **Conditional Field Display** - Fields appear/hide based on operation type
- **Streaming Support** - Real-time response streaming for chat and completions
- **Error Handling** - Comprehensive error messages and logging
- **Type Safety** - Full TypeScript support with strict typing
- **Response Storage** - Option to store/exclude API responses

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
   directus/extensions/operations/chatgpt-interactor/
   ```

## Usage

### 1. Basic Setup

1. Add the **ChatGPT Interactor** operation to your Directus flow
2. Enter your OpenAI API key (required)
3. Select the operation type from the dropdown
4. Configure parameters using the intuitive UI components

### 2. Operation Types

#### Chat Completion
- **Model**: Choose from GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo, etc.
- **System Message**: Optional system prompt to guide AI behavior
- **User Message**: The message to send to the AI
- **Temperature**: Control randomness (0-2)
- **Max Tokens**: Limit response length
- **Streaming**: Enable real-time response streaming

#### Image Generation
- **Model**: DALL-E 3 or DALL-E 2
- **Image Description**: Detailed description of the image
- **Size**: 1024x1024, 1792x1024, 1024x1792, etc.
- **Quality**: Standard or HD
- **Style**: Vivid or Natural

#### Audio Transcription/Translation
- **Audio File**: Upload audio file via Directus file picker
- **Language**: ISO 639-1 language code (for transcription)
- **Response Format**: JSON, Text, SRT, or VTT

#### Text Embeddings
- **Model**: Choose embedding model (text-embedding-3-large, etc.)
- **Text**: Input text to generate embeddings for

### 3. Response Handling

The extension returns structured responses:

```typescript
// Success Response
{
  success: true,
  data: {
    content: "AI response...",
    model: "gpt-3.5-turbo",
    usage: { /* token usage */ },
    finish_reason: "stop"
  }
}

// Error Response
{
  success: false,
  error: {
    message: "Error description",
    type: "ErrorType",
    operation_type: "chat_completion",
    model: "gpt-3.5-turbo"
  }
}
```

## Configuration Options

### Global Settings
- **API Key**: Your OpenAI API key (keep secure!)
- **Store Response**: Whether to include full API response in result

### Model-Specific Parameters
- **Temperature**: Creativity level (0 = deterministic, 2 = very creative)
- **Top P**: Nucleus sampling (0-1)
- **Frequency Penalty**: Reduce repetition (-2 to 2)
- **Presence Penalty**: Encourage new topics (-2 to 2)
- **Max Tokens**: Response length limit

## Security Notes

- **API Key Storage**: Store your OpenAI API key securely
- **Rate Limiting**: Be aware of OpenAI API rate limits
- **Cost Management**: Monitor token usage for cost control
- **Content Filtering**: Use moderation endpoint for user content

## Development

### Build for Development
```bash
npm run dev
```

### Validate Extension
```bash
npm run validate
```

### Type Checking
The extension uses strict TypeScript with comprehensive type definitions for all OpenAI API interactions.

## Supported Models

### Chat & Completion Models
- GPT-4o
- GPT-4o Mini  
- GPT-4 Turbo
- GPT-4
- GPT-3.5 Turbo

### Image Models
- DALL-E 3
- DALL-E 2

### Audio Models
- Whisper 1

### Embedding Models
- Text Embedding 3 Large
- Text Embedding 3 Small
- Text Embedding Ada 002

## Error Handling

The extension includes comprehensive error handling:
- Invalid API keys
- Missing required parameters
- File upload errors
- OpenAI API errors
- Network connectivity issues

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