import { defineOperationApi } from '@directus/extensions-sdk';
import OpenAI from 'openai';

type Options = {
	api_key: string;
	operation_type: 'text_generation' | 'image_generation' | 'file_search' | 'code_interpreter' | 'embeddings' | 'moderation' | 'list_models';
	model?: string;
	system_message?: string;
	user_message?: string;
	enable_web_search?: boolean;
	response_format?: 'text' | 'json_object' | 'json_schema';
	json_schema?: object;
	image_prompt?: string;
	search_query?: string;
	vector_store_ids?: string[];
	code_input?: string;
	text_input?: string;
	temperature?: number;
	max_output_tokens?: number;
	image_size?: '1024x1024' | '1792x1024' | '1024x1792' | '512x512' | '256x256';
	image_quality?: 'standard' | 'hd';
	image_style?: 'vivid' | 'natural';
	store_response?: boolean;
	previous_response_id?: string;
};

interface SuccessResult {
	success: true;
	data: Record<string, any>;
	response_id?: string;
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
	handler: async (options): Promise<OperationResult> => {
		const {
			api_key,
			operation_type = 'text_generation',
			model = 'gpt-4o-mini',
			system_message,
			user_message,
			enable_web_search = false,
			response_format = 'text',
			json_schema,
			image_prompt,
			search_query,
			vector_store_ids,
			code_input,
			text_input,
			max_output_tokens = 1000,
			image_size = '1024x1024',
			image_quality = 'standard',
			image_style = 'vivid',
			store_response = true,
			previous_response_id,
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
				case 'text_generation':
					if (!user_message) {
						throw new Error('User message is required for text generation');
					}

					const input = [];
					
					if (system_message) {
						input.push({
							role: 'system' as const,
							content: system_message,
						});
					}
					
					input.push({
						role: 'user' as const,
						content: user_message,
					});

					const tools = [];
					
					// Add web search tool if enabled
					if (enable_web_search) {
						tools.push({
							type: 'web_search_preview' as const,
						});
					}

					const responseParams: any = {
						model,
						input,
						max_output_tokens,
						store: store_response,
					};

					// Add tools if any are enabled
					if (tools.length > 0) {
						responseParams.tools = tools;
					}

					// Handle response format
					if (response_format === 'json_object') {
						responseParams.response_format = {
							type: 'json_object',
						};
					} else if (response_format === 'json_schema') {
						if (!json_schema) {
							throw new Error('JSON schema is required when response format is json_schema');
						}
						responseParams.response_format = {
							type: 'json_schema',
							json_schema: {
								name: 'response',
								schema: json_schema,
								strict: true,
							},
						};
					}

					if (previous_response_id) {
						responseParams.previous_response_id = previous_response_id;
					}

					const textResponse = await openai.responses.create(responseParams);
					
					result = {
						success: true,
						data: {
							content: textResponse.output_text || '',
							model: textResponse.model,
							usage: textResponse.usage,
							finish_reason: textResponse.status,
							response_format: response_format,
						},
						response_id: textResponse.id,
					};
					break;

				case 'image_generation':
					if (!image_prompt) {
						throw new Error('Image description is required for image generation');
					}

					const imageResponseParams: any = {
						model: model.includes('dall-e') ? model : 'dall-e-3',
						input: [
							{
								role: 'user' as const,
								content: image_prompt,
							}
						],
						tools: [
							{
								type: 'image_generation' as const,
								size: image_size,
								quality: image_quality,
								style: image_style,
							}
						],
						store: store_response,
					};

					if (previous_response_id) {
						imageResponseParams.previous_response_id = previous_response_id;
					}

					const imageResponse = await openai.responses.create(imageResponseParams);
					
					result = {
						success: true,
						data: {
							images: imageResponse.output || [],
							model: imageResponse.model,
							usage: imageResponse.usage,
						},
						response_id: imageResponse.id,
					};
					break;

				case 'file_search':
					if (!search_query) {
						throw new Error('Search query is required for file search');
					}

					if (!vector_store_ids || vector_store_ids.length === 0) {
						throw new Error('Vector store IDs are required for file search');
					}

					const fileSearchParams: any = {
						model,
						input: [
							{
								role: 'user' as const,
								content: search_query,
							}
						],
						tools: [
							{
								type: 'file_search' as const,
								vector_store_ids: vector_store_ids,
							}
						],
						store: store_response,
					};

					if (previous_response_id) {
						fileSearchParams.previous_response_id = previous_response_id;
					}

					const fileResponse = await openai.responses.create(fileSearchParams);
					
					result = {
						success: true,
						data: {
							content: fileResponse.output_text || '',
							model: fileResponse.model,
							usage: fileResponse.usage,
						},
						response_id: fileResponse.id,
					};
					break;

				case 'code_interpreter':
					if (!code_input) {
						throw new Error('Code input is required for code interpretation');
					}

					const codeParams: any = {
						model,
						input: [
							{
								role: 'user' as const,
								content: code_input,
							}
						],
						tools: [
							{
								type: 'code_interpreter' as const,
							}
						],
						store: store_response,
					};

					if (previous_response_id) {
						codeParams.previous_response_id = previous_response_id;
					}

					const codeResponse = await openai.responses.create(codeParams);
					
					result = {
						success: true,
						data: {
							content: codeResponse.output_text || '',
							files: codeResponse.output || [], // Files created by code interpreter
							model: codeResponse.model,
							usage: codeResponse.usage,
						},
						response_id: codeResponse.id,
					};
					break;

				case 'embeddings':
					if (!text_input) {
						throw new Error('Text is required for embeddings');
					}

					const embeddingParams: OpenAI.Embeddings.EmbeddingCreateParams = {
						model: model.includes('embedding') ? model : 'text-embedding-3-small',
						input: text_input,
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
					if (!text_input) {
						throw new Error('Text is required for moderation');
					}

					// Use the dedicated Moderation API endpoint
					const moderationParams: OpenAI.Moderations.ModerationCreateParams = {
						model: 'omni-moderation-latest', // Use the latest multimodal model
						input: text_input,
					};

					const moderation = await openai.moderations.create(moderationParams);
					result = {
						success: true,
						data: {
							results: moderation.results,
							model: moderation.model,
							flagged: moderation.results[0]?.flagged || false,
							categories: moderation.results[0]?.categories || {},
							category_scores: moderation.results[0]?.category_scores || {},
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
			console.log(`OpenAI operation completed: ${operation_type} with model: ${model}`);

			return store_response ? result : { success: true, data: {} };

		} catch (error: unknown) {
			console.error('OpenAI operation failed:', error);
			
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
