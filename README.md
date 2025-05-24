# Directus OpenAI Interactor Extension

A modern Directus extension that leverages OpenAI's cutting-edge **Responses API** for enhanced AI operations with intelligent parameter management. This extension provides context-aware UI components that show only relevant parameters for each operation type, eliminating clutter and improving user experience.

## 🚀 What's New in Version 1.1

### Enhanced Parameter Visibility
- **Strict Conditional Display**: Parameters now show only for their specific operation types
- **No Parameter Bleeding**: Image parameters won't appear in text generation, and vice versa
- **Cleaner Interface**: Each operation type shows only its relevant controls

### JSON Schema Support
- **Structured Responses**: Define JSON schemas to get perfectly structured AI responses
- **Schema Validation**: Built-in strict schema validation for reliable output
- **Dynamic UI**: Schema input field appears only when JSON Schema format is selected

### Improved Web Search Integration
- **Contextual Web Search**: Web search is now a checkbox within text generation operations
- **Smart Integration**: Web search results are seamlessly integrated into AI responses
- **Better UX**: No separate operation type needed for web-enabled conversations

### Migrated to OpenAI Responses API
- **Modern API Integration**: Uses OpenAI's latest Responses API instead of deprecated Chat Completions
- **Enhanced Capabilities**: Built-in tools for file search and code interpretation
- **Better State Management**: Server-side conversation state management with response IDs
- **Improved Performance**: Reduced latency and better token efficiency

## Features

### Supported OpenAI Operations

- **Text Generation** - Modern chat and text completion with optional web search and JSON schema responses
- **Image Generation** - Create images with DALL-E using built-in image generation tool
- **File Search** - Search through uploaded documents using vector store integration
- **Code Interpreter** - Execute Python code in a sandboxed environment for data analysis, visualizations, and file processing
- **Text Embeddings** - Generate vector embeddings for semantic search
- **Content Moderation** - Detect harmful content using OpenAI's latest multimodal moderation model
- **List Models** - Get available OpenAI models

### Intelligent Parameter Management

#### Text Generation Parameters Only:
- System message and user message inputs
- **Enable Web Search** checkbox for real-time web information
- **Response Format** dropdown (Text, JSON Object, JSON Schema)
- **JSON Schema** editor (appears only when JSON Schema format is selected)
- Generation controls (temperature, max tokens, top_p, penalties)
- Previous response ID for conversation continuity

#### Image Generation Parameters Only:
- Image description prompt
- Image size, quality, and style options
- Previous response ID for iterative generation

#### File Search Parameters Only:
- Search query input
- Vector store IDs (JSON array)
- Previous response ID for continued searches

#### Code Interpreter Parameters Only:
- Code or data analysis request input
- Previous response ID for multi-step analysis

#### Content Moderation Parameters Only:
- Text input (analyzes content for policy violations)

#### Text Processing Parameters Only:
- Text input (for embeddings operations)

### Advanced Features

- **Contextual Parameter Display** - Fields appear only for relevant operations
- **JSON Schema Responses** - Get perfectly structured responses with custom schemas
- **Integrated Web Search** - Enable web search within text generation conversations
- **Python Code Execution** - Run code, analyze data, create visualizations with Code Interpreter
- **Multimodal Content Moderation** - Detect harmful text and image content across 40+ languages
- **Conversation State Management** - Continue conversations using response IDs
- **Built-in Tool Integration** - File search and code execution capabilities
- **Error Handling** - Comprehensive error messages and logging
- **Type Safety** - Full TypeScript support with strict typing

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
3. Select the operation type - the UI will automatically show only relevant parameters
4. Configure parameters using the contextual UI components

### 2. Operation-Specific Usage

#### Text Generation with Smart Features
**Always Visible:**
- Model selection (GPT models)
- System message (optional) and user message (required)

**Optional Enhancements:**
- ✅ **Enable Web Search**: Check this box to allow AI to search the web for current information
- **Response Format**: Choose how the AI should respond:
  - **Text**: Normal conversational response
  - **JSON Object**: Structured JSON response
  - **JSON Schema**: Response following your custom schema

**JSON Schema Example:**
When you select "JSON Schema" format, a schema editor appears where you can define the structure:

```json
{
  "type": "object",
  "properties": {
    "summary": { "type": "string" },
    "sentiment": { "type": "string", "enum": ["positive", "negative", "neutral"] },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
  },
  "required": ["summary", "sentiment"]
}
```

#### Image Generation (Clean Interface)
**Only Shows:**
- Image description prompt
- Size (1024x1024, 1792x1024, etc.)
- Quality (Standard/HD)
- Style (Vivid/Natural)

#### File Search (Focused Parameters)
**Only Shows:**
- Search query
- Vector store IDs (JSON array)

#### Code Interpreter (Data Analysis & Computation)
**Only Shows:**
- Code or analysis request

**What Code Interpreter Can Do:**
- **Data Analysis**: Upload CSV files, perform statistical analysis, create charts
- **Python Programming**: Execute any Python code in a secure sandbox
- **File Operations**: Generate, process, and download files (persist for 20 minutes)
- **Visualizations**: Create matplotlib plots, graphs, and charts
- **Mathematical Computations**: Complex calculations, data processing
- **Image Processing**: When combined with vision, can manipulate images

#### Content Moderation (Policy Compliance)
**Only Shows:**
- Text input to analyze

**What Content Moderation Detects:**
- **Text Analysis** (13 categories): Hate speech, harassment, violence, self-harm, sexual content, illegal activities
- **Image Analysis** (6 categories): Sexual content, violence, harassment, hate speech, illicit activities
- **Multi-language Support**: Works across 40+ languages
- **Real-time Classification**: Returns detailed flags and confidence scores

### 3. Response Handling

Enhanced responses with conversation state and format information:

```typescript
// Text Generation Response
{
  success: true,
  data: {
    content: "AI response with web search results...",
    model: "gpt-4o-mini",
    usage: { /* token usage */ },
    finish_reason: "completed",
    response_format: "json_schema" // Indicates format used
  },
  response_id: "resp_abc123..." // For conversation continuity
}

// Code Interpreter Response
{
  success: true,
  data: {
    content: "Analysis complete. Here's what I found...",
    files: [
      {
        id: "file-abc123",
        filename: "analysis_chart.png",
        url: "download_url"
      }
    ],
    model: "gpt-4o-mini",
    usage: { /* token usage */ }
  },
  response_id: "resp_def456..."
}

// Content Moderation Response
{
  success: true,
  data: {
    flagged: false,
    categories: {
      hate: false,
      harassment: false,
      violence: false,
      sexual: false,
      // ... other categories
    },
    category_scores: {
      hate: 0.001,
      harassment: 0.002,
      // ... confidence scores
    },
    model: "omni-moderation-latest"
  }
}
```

## Configuration Benefits

### Strict Parameter Visibility
- **Text Generation**: Only text-related parameters and web search options
- **Image Generation**: Only image-specific options (size, quality, style)
- **File Search**: Only search query and vector store configuration
- **Code Interpreter**: Only code/analysis request input
- **Content Moderation**: Only text input for analysis
- **No Parameter Overlap**: Parameters never appear for wrong operation types

### Code Interpreter Benefits
- **Secure Execution**: Python code runs in isolated sandbox environment
- **Data Persistence**: Files and variables persist for 20 minutes between calls
- **Rich Libraries**: Access to pandas, matplotlib, numpy, and other popular packages
- **File Downloads**: Generate files that users can download and use
- **Iterative Development**: AI can debug and improve code based on execution results

### Content Moderation Benefits
- **Policy Compliance**: Ensure content meets OpenAI usage policies
- **Multi-modal Detection**: Analyze both text and images simultaneously
- **Detailed Reporting**: Get specific categories and confidence scores
- **Global Support**: Works across 40+ languages with high accuracy
- **Real-time Analysis**: Fast classification for live content filtering

## Advanced Use Cases

### Data Analysis with Code Interpreter
```python
# Example request: "Analyze this sales data and create a visualization"
# Code Interpreter can:
# 1. Read uploaded CSV files
# 2. Perform statistical analysis
# 3. Create charts and graphs
# 4. Generate downloadable reports
```

### Structured Data Extraction
```json
// Schema for extracting contact information
{
  "type": "object",
  "properties": {
    "contacts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "phone": { "type": "string" }
        },
        "required": ["name"]
      }
    }
  }
}
```

### Content Safety Pipeline
Use Content Moderation to:
- Pre-filter user inputs before processing
- Validate AI-generated content before display
- Monitor community content for policy violations
- Implement custom moderation thresholds for your use case

### Web-Enhanced Conversations
Enable web search for text generation to get responses that include:
- Current news and events
- Real-time data and statistics
- Recent research and publications
- Current pricing and availability

### Multi-Step Workflows
Use `response_id` to chain operations:
1. Generate initial content
2. Use Code Interpreter to analyze data
3. Apply Content Moderation to ensure compliance
4. Maintain context across multiple operations

## Security & Best Practices

- **API Key Security**: Store your OpenAI API key securely in Directus environment
- **Vector Store Management**: Use proper vector store IDs for file search operations
- **Schema Validation**: Test your JSON schemas thoroughly before production use
- **Web Search Costs**: Monitor usage when web search is enabled (additional charges apply)
- **Code Execution Safety**: Code Interpreter runs in secure sandbox, but monitor for resource usage
- **Content Filtering**: Use moderation proactively to prevent policy violations
- **Response Storage**: Enable response storage for conversation continuity

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