import { defineOperationApp } from '@directus/extensions-sdk';

export default defineOperationApp({
	id: 'chatgpt-interactor',
	name: 'OpenAI Interactor',
	icon: 'smart_toy',
	description: 'Interact with OpenAI using the modern Responses API',
	overview: ({ operation_type, model, user_message, image_prompt, analysis_prompt, image_url, search_query, code_input, text_input }) => [
		{
			label: 'Operation',
			text: operation_type || 'Text Generation',
		},
		{
			label: 'Model',
			text: model || 'gpt-4o-mini',
		},
		{
			label: 'Input',
			text: user_message || image_prompt || analysis_prompt || search_query || code_input || text_input || image_url || 'No input provided',
		},
	],
	options: [
		{
			field: 'api_key',
			name: 'OpenAI API Key',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
				options: {
					placeholder: 'sk-... or {{$last.api_key}}',
				},
				note: 'Your OpenAI API key or Directus placeholder (e.g., {{$last.api_key}}, {{$trigger.api_key}})',
			},
		},
		{
			field: 'operation_type',
			name: 'Operation Type',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{ text: 'Text Generation', value: 'text_generation' },
						{ text: 'Image Generation', value: 'image_generation' },
						{ text: 'Image Analysis', value: 'image_analysis' },
						{ text: 'File Search', value: 'file_search' },
						{ text: 'File Search with Image', value: 'file_search_with_image' },
						{ text: 'Code Interpreter', value: 'code_interpreter' },
						{ text: 'Text Embeddings', value: 'embeddings' },
						{ text: 'Content Moderation', value: 'moderation' },
						{ text: 'List Models', value: 'list_models' },
					],
				},
				required: true,
			},
			schema: {
				default_value: 'text_generation',
			},
		},
		{
			field: 'model',
			name: 'Model',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{ text: 'GPT-4o', value: 'gpt-4o' },
						{ text: 'GPT-4o Mini', value: 'gpt-4o-mini' },
						{ text: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
						{ text: 'GPT-4', value: 'gpt-4' },
						{ text: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
						{ text: 'Text Embedding 3 Large', value: 'text-embedding-3-large' },
						{ text: 'Text Embedding 3 Small', value: 'text-embedding-3-small' },
						{ text: 'Text Embedding Ada 002', value: 'text-embedding-ada-002' },
						{ text: 'DALL-E 3', value: 'dall-e-3' },
						{ text: 'DALL-E 2', value: 'dall-e-2' },
					],
				},
			},
			schema: {
				default_value: 'gpt-4o-mini',
			},
		},
		{
			field: 'previous_response_id',
			name: 'Previous Response ID',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
				options: {
					placeholder: 'resp_...',
				},
				note: 'Use this to continue a previous conversation (optional)',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['text_generation', 'image_generation', 'image_analysis', 'file_search', 'file_search_with_image', 'code_interpreter'],
							},
						},
						hidden: false,
					},
				],
			},
		},
		
		// === TEXT GENERATION PARAMETERS ===
		{
			field: 'system_message_text',
			name: 'System Message',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'You are a helpful assistant...',
				},
				note: 'System prompt to guide the AI behavior',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'text_generation',
							},
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'user_message',
			name: 'User Message',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'Type your message here...',
				},
				note: 'The message to send to the AI',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'text_generation',
							},
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'enable_web_search',
			name: 'Enable Web Search',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				note: 'Allow the AI to search the web for current information',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'text_generation',
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: false,
			},
		},
		{
			field: 'response_format',
			name: 'Response Format',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{ text: 'Text', value: 'text' },
						{ text: 'JSON Object', value: 'json_object' },
						{ text: 'JSON Schema', value: 'json_schema' },
					],
				},
				note: 'Format of the AI response',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'text_generation',
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: 'text',
			},
		},
		{
			field: 'json_schema',
			name: 'JSON Schema',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'input-code',
				options: {
					language: 'json',
					placeholder: '{\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" },\n    "age": { "type": "number" }\n  },\n  "required": ["name"]\n}',
				},
				note: 'JSON schema to structure the AI response',
				hidden: true,
				conditions: [
					{
						rule: {
							_and: [
								{
									operation_type: {
										_eq: 'text_generation',
									},
								},
								{
									response_format: {
										_eq: 'json_schema',
									},
								},
							],
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'max_output_tokens',
			name: 'Max Output Tokens',
			type: 'integer',
			meta: {
				width: 'half',
				interface: 'input',
				options: {
					min: 1,
					max: 4096,
					placeholder: '1000',
				},
				note: 'Maximum number of tokens to generate',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'text_generation',
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: 1000,
			},
		},

		// === IMAGE GENERATION PARAMETERS ===
		{
			field: 'image_prompt',
			name: 'Image Description',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'A detailed description of the image to generate...',
				},
				note: 'Description of the image to generate',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'image_generation',
							},
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'image_size',
			name: 'Image Size',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{ text: '1024x1024', value: '1024x1024' },
						{ text: '1792x1024', value: '1792x1024' },
						{ text: '1024x1792', value: '1024x1792' },
						{ text: '512x512', value: '512x512' },
						{ text: '256x256', value: '256x256' },
					],
				},
				note: 'Size of the generated image',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'image_generation',
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: '1024x1024',
			},
		},
		{
			field: 'image_quality',
			name: 'Image Quality',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{ text: 'Standard', value: 'standard' },
						{ text: 'HD', value: 'hd' },
					],
				},
				note: 'Quality of the generated image',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'image_generation',
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: 'standard',
			},
		},
		{
			field: 'image_style',
			name: 'Image Style',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{ text: 'Vivid', value: 'vivid' },
						{ text: 'Natural', value: 'natural' },
					],
				},
				note: 'Style of the generated image',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'image_generation',
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: 'vivid',
			},
		},

		// === IMAGE ANALYSIS PARAMETERS ===
		{
			field: 'image_url',
			name: 'Image URL',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
				options: {
					placeholder: 'https://example.com/image.jpg',
				},
				note: 'URL of the image to analyze (leave empty if providing base64)',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['image_analysis', 'file_search_with_image'],
							},
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'image_base64',
			name: 'Image Base64',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'iVBORw0KGgoAAAANSUhEUgAA...',
				},
				note: 'Base64 encoded image data (leave empty if providing URL)',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['image_analysis', 'file_search_with_image'],
							},
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'analysis_prompt',
			name: 'Analysis Prompt',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'Describe what you see in this image...',
				},
				note: 'Specific instructions for analyzing the image (optional - default: general analysis)',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'image_analysis',
							},
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'system_message_image',
			name: 'System Message',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'You are an expert image analyst...',
				},
				note: 'System prompt to guide the AI behavior for image analysis',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'image_analysis',
							},
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'response_format',
			name: 'Response Format',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{ text: 'Text', value: 'text' },
						{ text: 'JSON Object', value: 'json_object' },
						{ text: 'JSON Schema', value: 'json_schema' },
					],
				},
				note: 'Format of the AI response',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['image_analysis', 'file_search_with_image'],
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: 'text',
			},
		},
		{
			field: 'json_schema',
			name: 'JSON Schema',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'input-code',
				options: {
					language: 'json',
					placeholder: '{\n  "type": "object",\n  "properties": {\n    "objects": { "type": "array" },\n    "colors": { "type": "array" },\n    "text": { "type": "string" }\n  }\n}',
				},
				note: 'JSON schema to structure the image analysis response',
				hidden: true,
				conditions: [
					{
						rule: {
							_and: [
								{
									operation_type: {
										_in: ['image_analysis', 'file_search_with_image'],
									},
								},
								{
									response_format: {
										_eq: 'json_schema',
									},
								},
							],
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'max_output_tokens',
			name: 'Max Output Tokens',
			type: 'integer',
			meta: {
				width: 'half',
				interface: 'input',
				options: {
					min: 1,
					max: 4096,
					placeholder: '1000',
				},
				note: 'Maximum number of tokens to generate',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['image_analysis', 'file_search_with_image'],
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: 1000,
			},
		},

		// === FILE SEARCH PARAMETERS ===
		{
			field: 'system_message_file',
			name: 'System Message',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'You are an expert file search assistant...',
				},
				note: 'System prompt to guide the AI behavior for file search',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'file_search',
							},
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'search_query',
			name: 'Search Query',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'What would you like to search for in the files?',
				},
				note: 'Query to search through uploaded documents (for file search with image, this will be combined with image analysis)',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['file_search', 'file_search_with_image'],
							},
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'vector_store_ids',
			name: 'Vector Store IDs',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'input-code',
				options: {
					language: 'json',
					placeholder: '["vs_123", "vs_456"]',
				},
				note: 'Array of vector store IDs to search in (required for file search)',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['file_search', 'file_search_with_image'],
							},
						},
						hidden: false,
					},
				],
			},
		},




		// === FILE SEARCH WITH IMAGE PARAMETERS ===
		{
			field: 'system_message_file_image',
			name: 'System Message',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'You are an expert at analyzing images and searching through documents...',
				},
				note: 'System prompt to guide the AI behavior for file search with image analysis',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'file_search_with_image',
							},
						},
						hidden: false,
					},
				],
			},
		},


		// === CODE INTERPRETER PARAMETERS ===
		{
			field: 'code_input',
			name: 'Code or Data Analysis Request',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'Analyze this data... or Write Python code to...',
				},
				note: 'Request for code interpretation or data analysis',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'code_interpreter',
							},
						},
						hidden: false,
					},
				],
			},
		},

		// === TEXT PROCESSING PARAMETERS ===
		{
			field: 'text_input',
			name: 'Text Input',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'Enter text for embeddings or moderation...',
				},
				note: 'Text for embeddings or moderation analysis',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['embeddings', 'moderation'],
							},
						},
						hidden: false,
					},
				],
			},
		},

		// === STORAGE OPTIONS ===
		{
			field: 'store_response',
			name: 'Store Response',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				note: 'Store the API response for conversation continuity',
				hidden: true,
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['text_generation', 'image_generation', 'file_search', 'file_search_with_image', 'code_interpreter'],
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: true,
			},
		},
	],
});
