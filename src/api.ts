import { defineOperationApi } from '@directus/extensions-sdk';
import OpenAI from 'openai';

type Options = {
	api_key: string;
	operation_type: 'text_generation' | 'image_generation' | 'image_analysis' | 'file_search' | 'file_search_with_image' | 'code_interpreter' | 'embeddings' | 'moderation' | 'list_models';
	model?: string;
	system_message_text?: string;
	system_message_image?: string;
	system_message_file?: string;
	system_message_file_image?: string;
	user_message?: string;
	enable_web_search?: boolean;
	response_format?: 'text' | 'json_object' | 'json_schema';
	json_schema?: object;
	image_prompt?: string;
	image_url?: string;
	image_base64?: string;
	analysis_prompt?: string;
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
			system_message_text,
			system_message_image,
			system_message_file,
			system_message_file_image,
			user_message,
			enable_web_search = false,
			response_format = 'text',
			json_schema,
			image_prompt,
			image_url,
			image_base64,
			analysis_prompt,
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
					
					if (system_message_text) {
						input.push({
							role: 'system' as const,
							content: system_message_text,
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

				case 'image_analysis':
					if (!image_url && !image_base64) {
						throw new Error('Image URL or image base64 is required for image analysis');
					}

					const analysisInput = [];
					
					if (system_message_image) {
						analysisInput.push({
							role: 'system' as const,
							content: system_message_image,
						});
					}

					// Create the user message with image content using Responses API format
					const userContent = [];
					
					// Add text prompt if provided
					if (analysis_prompt) {
						userContent.push({
							type: 'input_text' as const,
							text: analysis_prompt,
						});
					} else {
						userContent.push({
							type: 'input_text' as const,
							text: 'Please analyze this image and describe what you see, including any text, objects, colors, composition, and other notable features.',
						});
					}

					// Add image content
					if (image_url) {
						userContent.push({
							type: 'input_image' as const,
							image_url: image_url,
							detail: 'high',
						});
					} else if (image_base64) {
						// Handle base64 image data
						let imageDataUrl: string;
						
						// Check if the base64 data already has the data URL prefix
						if (image_base64.startsWith('data:image/')) {
							imageDataUrl = image_base64;
						} else {
							// Detect image format from base64 header or default to png
							let imageFormat = 'png'; // Default to png for better compatibility
							
							// Try to detect image format from base64 header
							const base64Header = image_base64.substring(0, 20);
							if (base64Header.startsWith('/9j/') || base64Header.startsWith('iVBO')) {
								imageFormat = base64Header.startsWith('/9j/') ? 'jpeg' : 'png';
							} else if (base64Header.startsWith('UklGR')) {
								imageFormat = 'webp';
							} else if (base64Header.startsWith('R0lGOD')) {
								imageFormat = 'gif';
							}
							
							// Clean base64 string (remove any whitespace or newlines)
							const cleanBase64 = image_base64.replace(/\s+/g, '');
							
							// Validate base64 format
							const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
							if (!base64Regex.test(cleanBase64)) {
								throw new Error('Invalid base64 format detected. Please ensure the input is correctly encoded in base64 format.');
							}
							
							imageDataUrl = `data:image/${imageFormat};base64,${cleanBase64}`;
						}
						
						userContent.push({
							type: 'input_image' as const,
							image_url: imageDataUrl,
							detail: 'high',
						});
					}

					analysisInput.push({
						role: 'user' as const,
						content: userContent,
					});

					const analysisResponseParams: any = {
						model: model || 'gpt-4o-mini',
						input: analysisInput,
						max_output_tokens,
						store: store_response,
					};

					// Handle response format
					if (response_format === 'json_object') {
						analysisResponseParams.response_format = {
							type: 'json_object',
						};
					} else if (response_format === 'json_schema') {
						if (!json_schema) {
							throw new Error('JSON schema is required when response format is json_schema');
						}
						analysisResponseParams.response_format = {
							type: 'json_schema',
							json_schema: {
								name: 'analysis_response',
								schema: json_schema,
								strict: true,
							},
						};
					}

					if (previous_response_id) {
						analysisResponseParams.previous_response_id = previous_response_id;
					}

					const analysisResponse = await openai.responses.create(analysisResponseParams);
					
					result = {
						success: true,
						data: {
							content: analysisResponse.output_text || '',
							model: analysisResponse.model,
							usage: analysisResponse.usage,
							finish_reason: analysisResponse.status,
							response_format: response_format,
						},
						response_id: analysisResponse.id,
					};
					break;

				case 'file_search':
					if (!search_query) {
						throw new Error('Search query is required for file search');
					}

					if (!vector_store_ids || vector_store_ids.length === 0) {
						throw new Error('Vector store IDs are required for file search');
					}

					const fileSearchInput = [];
					
					if (system_message_file) {
						fileSearchInput.push({
							role: 'system' as const,
							content: system_message_file,
						});
					}

					fileSearchInput.push({
						role: 'user' as const,
						content: search_query,
					});

					const fileSearchParams: any = {
						model,
						input: fileSearchInput,
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

				case 'file_search_with_image':
					if (!search_query) {
						throw new Error('Search query is required for file search with image');
					}

					if (!vector_store_ids || vector_store_ids.length === 0) {
						throw new Error('Vector store IDs are required for file search with image');
					}

					if (!image_url && !image_base64) {
						throw new Error('Image URL or image base64 is required for file search with image');
					}

					const fileSearchWithImageInput = [];
					
					if (system_message_file_image) {
						fileSearchWithImageInput.push({
							role: 'system' as const,
							content: system_message_file_image,
						});
					}

					// Create the user message with both text and image content
					const userContentWithImage = [];
					
					// Add text query
					userContentWithImage.push({
						type: 'input_text' as const,
						text: search_query,
					});

					// Add image content
					if (image_url) {
						userContentWithImage.push({
							type: 'input_image' as const,
							image_url: image_url,
							detail: 'high',
						});
					} else if (image_base64) {
						// Handle base64 image data
						let imageDataUrl: string;
						
						// Check if the base64 data already has the data URL prefix
						if (image_base64.startsWith('data:image/')) {
							imageDataUrl = image_base64;
						} else {
							// Detect image format from base64 header or default to png
							let imageFormat = 'png'; // Default to png for better compatibility
							
							// Try to detect image format from base64 header
							const base64Header = image_base64.substring(0, 20);
							if (base64Header.startsWith('/9j/') || base64Header.startsWith('iVBO')) {
								imageFormat = base64Header.startsWith('/9j/') ? 'jpeg' : 'png';
							} else if (base64Header.startsWith('UklGR')) {
								imageFormat = 'webp';
							} else if (base64Header.startsWith('R0lGOD')) {
								imageFormat = 'gif';
							}
							
							// Clean base64 string (remove any whitespace or newlines)
							const cleanBase64 = image_base64.replace(/\s+/g, '');
							
							// Validate base64 format
							const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
							if (!base64Regex.test(cleanBase64)) {
								throw new Error('Invalid base64 format detected. Please ensure the input is correctly encoded in base64 format.');
							}
							
							imageDataUrl = `data:image/${imageFormat};base64,${cleanBase64}`;
						}
						
						userContentWithImage.push({
							type: 'input_image' as const,
							image_url: imageDataUrl,
							detail: 'high',
						});
					}

					fileSearchWithImageInput.push({
						role: 'user' as const,
						content: userContentWithImage,
					});

					const fileSearchWithImageParams: any = {
						model: model || 'gpt-4o-mini',
						input: fileSearchWithImageInput,
						tools: [
							{
								type: 'file_search' as const,
								vector_store_ids: vector_store_ids,
							}
						],
						max_output_tokens,
						store: store_response,
					};

					// Handle response format
					if (response_format === 'json_object') {
						fileSearchWithImageParams.response_format = {
							type: 'json_object',
						};
					} else if (response_format === 'json_schema') {
						if (!json_schema) {
							throw new Error('JSON schema is required when response format is json_schema');
						}
						fileSearchWithImageParams.response_format = {
							type: 'json_schema',
							json_schema: {
								name: 'file_search_with_image_response',
								schema: json_schema,
								strict: true,
							},
						};
					}

					if (previous_response_id) {
						fileSearchWithImageParams.previous_response_id = previous_response_id;
					}

					const fileSearchWithImageResponse = await openai.responses.create(fileSearchWithImageParams);
					
					result = {
						success: true,
						data: {
							content: fileSearchWithImageResponse.output_text || '',
							model: fileSearchWithImageResponse.model,
							usage: fileSearchWithImageResponse.usage,
							finish_reason: fileSearchWithImageResponse.status,
							response_format: response_format,
						},
						response_id: fileSearchWithImageResponse.id,
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

			return result;

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
