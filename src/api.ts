import { defineOperationApi } from '@directus/extensions-sdk';
import OpenAI from 'openai';

type Options = {
	api_key: string;
	operation_type: 'chat_completion' | 'completion' | 'image_generation' | 'audio_transcription' | 'audio_translation' | 'embeddings' | 'moderation' | 'list_models';
	model?: string;
	system_message?: string;
	message?: string;
	prompt?: string;
	image_prompt?: string;
	audio_file?: string;
	temperature?: number;
	max_tokens?: number;
	top_p?: number;
	frequency_penalty?: number;
	presence_penalty?: number;
	image_size?: '1024x1024' | '1792x1024' | '1024x1792' | '512x512' | '256x256';
	image_quality?: 'standard' | 'hd';
	image_style?: 'vivid' | 'natural';
	audio_language?: string;
	response_format?: 'json' | 'text' | 'srt' | 'vtt';
	store_response?: boolean;
};

interface SuccessResult {
	success: true;
	data: Record<string, any>;
}

interface ErrorResult {
	success: false;
	error: {
		message: string;
		type: string;
		operation_type: string;
		model?: string;
	};
}

type OperationResult = SuccessResult | ErrorResult;

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	return 'Unknown error occurred';
}

function getErrorType(error: unknown): string {
	if (error instanceof Error) {
		return error.constructor.name;
	}
	return 'UnknownError';
}

export default defineOperationApi<Options>({
	id: 'chatgpt-interactor',
	handler: async (options, { services, database, accountability, getSchema }): Promise<OperationResult> => {
		const {
			api_key,
			operation_type,
			model = 'gpt-3.5-turbo',
			system_message,
			message,
			prompt,
			image_prompt,
			audio_file,
			temperature = 1,
			max_tokens = 1000,
			top_p = 1,
			frequency_penalty = 0,
			presence_penalty = 0,
			image_size = '1024x1024',
			image_quality = 'standard',
			image_style = 'vivid',
			audio_language,
			response_format = 'json',
			store_response = true,
		} = options;

		if (!api_key) {
			throw new Error('OpenAI API key is required');
		}

		const openai = new OpenAI({
			apiKey: api_key,
		});

		let result: SuccessResult;

		try {
			switch (operation_type) {
				case 'chat_completion':
					if (!message) {
						throw new Error('Message is required for chat completion');
					}

					const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
					
					if (system_message) {
						messages.push({
							role: 'system',
							content: system_message,
						});
					}
					
					messages.push({
						role: 'user',
						content: message,
					});

					const chatParams: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
						model,
						messages,
						temperature,
						max_tokens,
						top_p,
						frequency_penalty,
						presence_penalty,
					};

					const chatCompletion = await openai.chat.completions.create(chatParams);
					result = {
						success: true,
						data: {
							content: chatCompletion.choices[0]?.message?.content || '',
							model: chatCompletion.model,
							usage: chatCompletion.usage,
							finish_reason: chatCompletion.choices[0]?.finish_reason,
						},
					};
					break;

				case 'completion':
					if (!prompt) {
						throw new Error('Prompt is required for text completion');
					}

					const completionParams: OpenAI.Completions.CompletionCreateParams = {
						model,
						prompt,
						temperature,
						max_tokens,
						top_p,
						frequency_penalty,
						presence_penalty,
					};

					const textCompletion = await openai.completions.create(completionParams);
					result = {
						success: true,
						data: {
							content: textCompletion.choices[0]?.text || '',
							model: textCompletion.model,
							usage: textCompletion.usage,
							finish_reason: textCompletion.choices[0]?.finish_reason,
						},
					};
					break;

				case 'image_generation':
					if (!image_prompt) {
						throw new Error('Image description is required for image generation');
					}

					const imageParams: OpenAI.Images.ImageGenerateParams = {
						model: model as 'dall-e-2' | 'dall-e-3',
						prompt: image_prompt,
						size: image_size,
						quality: image_quality,
						style: image_style,
						n: 1,
					};

					const imageResponse = await openai.images.generate(imageParams);
					result = {
						success: true,
						data: {
							images: imageResponse.data,
							model,
						},
					};
					break;

				case 'audio_transcription':
					if (!audio_file) {
						throw new Error('Audio file is required for transcription');
					}

					try {
						// Get file from Directus
						const { FilesService } = services;
						const filesService = new FilesService({
							schema: await getSchema(),
							accountability,
						});

						const file = await filesService.readOne(audio_file);
						if (!file) {
							throw new Error('Audio file not found');
						}

						// Create a File object for the OpenAI API
						const fileBuffer = await filesService.readOne(audio_file, { 
							transformationParams: {} 
						});

						const transcriptionParams: OpenAI.Audio.Transcriptions.TranscriptionCreateParams = {
							file: new File([fileBuffer], file.filename_download || 'audio.mp3'),
							model: 'whisper-1',
							language: audio_language,
							response_format: response_format as 'json' | 'text' | 'srt' | 'vtt',
						};

						const transcription = await openai.audio.transcriptions.create(transcriptionParams);
						result = {
							success: true,
							data: {
								transcription,
								model: 'whisper-1',
							},
						};
					} catch (error: unknown) {
						throw new Error(`Audio transcription failed: ${getErrorMessage(error)}`);
					}
					break;

				case 'audio_translation':
					if (!audio_file) {
						throw new Error('Audio file is required for translation');
					}

					try {
						// Get file from Directus
						const { FilesService } = services;
						const filesService = new FilesService({
							schema: await getSchema(),
							accountability,
						});

						const file = await filesService.readOne(audio_file);
						if (!file) {
							throw new Error('Audio file not found');
						}

						// Create a File object for the OpenAI API
						const fileBuffer = await filesService.readOne(audio_file, { 
							transformationParams: {} 
						});

						const translationParams: OpenAI.Audio.Translations.TranslationCreateParams = {
							file: new File([fileBuffer], file.filename_download || 'audio.mp3'),
							model: 'whisper-1',
							response_format: response_format as 'json' | 'text' | 'srt' | 'vtt',
						};

						const translation = await openai.audio.translations.create(translationParams);
						result = {
							success: true,
							data: {
								translation,
								model: 'whisper-1',
							},
						};
					} catch (error: unknown) {
						throw new Error(`Audio translation failed: ${getErrorMessage(error)}`);
					}
					break;

				case 'embeddings':
					if (!prompt) {
						throw new Error('Text is required for embeddings');
					}

					const embeddingParams: OpenAI.Embeddings.EmbeddingCreateParams = {
						model,
						input: prompt,
					};

					const embedding = await openai.embeddings.create(embeddingParams);
					result = {
						success: true,
						data: {
							embeddings: embedding.data,
							model: embedding.model,
							usage: embedding.usage,
						},
					};
					break;

				case 'moderation':
					if (!prompt) {
						throw new Error('Text is required for moderation');
					}

					const moderationParams: OpenAI.Moderations.ModerationCreateParams = {
						input: prompt,
					};

					const moderation = await openai.moderations.create(moderationParams);
					result = {
						success: true,
						data: {
							results: moderation.results,
							model: moderation.model,
						},
					};
					break;

				case 'list_models':
					const models = await openai.models.list();
					result = {
						success: true,
						data: {
							models: models.data,
						},
					};
					break;

				default:
					const exhaustiveCheck: never = operation_type;
					throw new Error(`Unknown operation type: ${exhaustiveCheck}`);
			}

			// Log successful operation
			console.log(`ChatGPT operation completed: ${operation_type} with model: ${model}`);

			return store_response ? result : { success: true, data: {} };

		} catch (error: unknown) {
			console.error('ChatGPT operation failed:', error);
			
			return {
				success: false,
				error: {
					message: getErrorMessage(error),
					type: getErrorType(error),
					operation_type,
					model,
				},
			};
		}
	},
});
