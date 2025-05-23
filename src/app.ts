import { defineOperationApp } from '@directus/extensions-sdk';

export default defineOperationApp({
	id: 'chatgpt-interactor',
	name: 'ChatGPT Interactor',
	icon: 'smart_toy',
	description: 'Interact with OpenAI ChatGPT API endpoints',
	overview: ({ operation_type, model, prompt, message }) => [
		{
			label: 'Operation',
			text: operation_type || 'Chat Completion',
		},
		{
			label: 'Model',
			text: model || 'gpt-3.5-turbo',
		},
		{
			label: 'Input',
			text: prompt || message || 'No input provided',
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
					masked: true,
					placeholder: 'sk-...',
				},
				note: 'Your OpenAI API key. Keep this secure!',
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
						{ text: 'Chat Completion', value: 'chat_completion' },
						{ text: 'Text Completion', value: 'completion' },
						{ text: 'Image Generation', value: 'image_generation' },
						{ text: 'Audio Transcription', value: 'audio_transcription' },
						{ text: 'Audio Translation', value: 'audio_translation' },
						{ text: 'Text Embeddings', value: 'embeddings' },
						{ text: 'Content Moderation', value: 'moderation' },
						{ text: 'List Models', value: 'list_models' },
					],
				},
			},
			schema: {
				default_value: 'chat_completion',
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
						{ text: 'Whisper 1', value: 'whisper-1' },
					],
				},
			},
			schema: {
				default_value: 'gpt-3.5-turbo',
			},
		},
		{
			field: 'system_message',
			name: 'System Message',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'You are a helpful assistant...',
				},
				note: 'System prompt to guide the AI behavior (for chat completions)',
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'chat_completion',
							},
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'message',
			name: 'User Message',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'Type your message here...',
				},
				note: 'The message to send to the AI',
				conditions: [
					{
						rule: {
							operation_type: {
								_eq: 'chat_completion',
							},
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'prompt',
			name: 'Prompt',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: 'Enter your prompt...',
				},
				note: 'Text prompt for completion or embeddings',
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['completion', 'embeddings', 'moderation'],
							},
						},
						hidden: false,
					},
				],
			},
		},
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
			field: 'audio_file',
			name: 'Audio File',
			type: 'uuid',
			meta: {
				width: 'full',
				interface: 'file',
				note: 'Audio file to transcribe or translate',
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['audio_transcription', 'audio_translation'],
							},
						},
						hidden: false,
					},
				],
			},
		},
		{
			field: 'temperature',
			name: 'Temperature',
			type: 'float',
			meta: {
				width: 'half',
				interface: 'slider',
				options: {
					min: 0,
					max: 2,
					step: 0.1,
				},
				note: 'Controls randomness (0-2). Higher values make output more random',
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['chat_completion', 'completion'],
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: 1,
			},
		},
		{
			field: 'max_tokens',
			name: 'Max Tokens',
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
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['chat_completion', 'completion'],
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
		{
			field: 'top_p',
			name: 'Top P',
			type: 'float',
			meta: {
				width: 'half',
				interface: 'slider',
				options: {
					min: 0,
					max: 1,
					step: 0.01,
				},
				note: 'Nucleus sampling parameter (0-1)',
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['chat_completion', 'completion'],
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: 1,
			},
		},
		{
			field: 'frequency_penalty',
			name: 'Frequency Penalty',
			type: 'float',
			meta: {
				width: 'half',
				interface: 'slider',
				options: {
					min: -2,
					max: 2,
					step: 0.1,
				},
				note: 'Penalty for token frequency (-2 to 2)',
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['chat_completion', 'completion'],
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: 0,
			},
		},
		{
			field: 'presence_penalty',
			name: 'Presence Penalty',
			type: 'float',
			meta: {
				width: 'half',
				interface: 'slider',
				options: {
					min: -2,
					max: 2,
					step: 0.1,
				},
				note: 'Penalty for token presence (-2 to 2)',
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['chat_completion', 'completion'],
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: 0,
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
		{
			field: 'audio_language',
			name: 'Audio Language',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				options: {
					placeholder: 'en',
				},
				note: 'Language of the audio (ISO 639-1 code)',
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['audio_transcription', 'audio_translation'],
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
						{ text: 'JSON', value: 'json' },
						{ text: 'Text', value: 'text' },
						{ text: 'SRT', value: 'srt' },
						{ text: 'VTT', value: 'vtt' },
					],
				},
				note: 'Format of the transcription response',
				conditions: [
					{
						rule: {
							operation_type: {
								_in: ['audio_transcription', 'audio_translation'],
							},
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: 'json',
			},
		},
		{
			field: 'store_response',
			name: 'Store Response',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				note: 'Store the API response in the operation result',
			},
			schema: {
				default_value: true,
			},
		},
	],
});
