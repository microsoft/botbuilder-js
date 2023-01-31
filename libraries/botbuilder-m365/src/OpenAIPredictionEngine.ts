import { PredictedCommand, PredictionEngine } from './PredictionEngine';
import { TurnState } from './TurnState';
import { DefaultTurnState } from './DefaultTurnStateManager';
import { TurnContext } from 'botbuilder-core';
import { Configuration, ConfigurationParameters, OpenAIApi, CreateCompletionRequest, CreateCompletionResponse } from 'openai';
import { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { ResponseParser } from './ResponseParser';
import { PromptParser, PromptTemplate } from './PromptParser';
import { ConversationHistoryOptions, ConversationHistoryTracker } from './ConversationHistoryTracker';


export interface OpenAIPredictionEngineOptions {
    configuration: ConfigurationParameters;
    basePath?: string;
    axios?: AxiosInstance;
    prompt: PromptTemplate;
    promptConfig: CreateCompletionRequest;
    topicFilter?: PromptTemplate; 
    topicFilterConfig?: CreateCompletionRequest;
    conversationHistory?: Partial<ConversationHistoryOptions>;
}

export class OpenAIPredictionEngine<TState extends TurnState = DefaultTurnState> implements PredictionEngine<TState> {
    private readonly _options: OpenAIPredictionEngineOptions;
    private readonly _configuration: Configuration;
    private readonly _openai: OpenAIApi;
    private readonly _prompts = new Map<string, CreateCompletionRequest>();


    public constructor(options?: OpenAIPredictionEngineOptions) {
        this._options = Object.assign({
            conversationHistory: {
                userPrefix: 'Human: ',
                botPrefix: 'AI: '
            }
        } as OpenAIPredictionEngineOptions, options);
        this._configuration = new Configuration(options.configuration);
        this._openai = new OpenAIApi(this._configuration, options.basePath, options.axios as any);
    }

    public get configuration(): Configuration {
        return this._configuration;
    }

    public get openai(): OpenAIApi {
        return this._openai;
    }

    public async predictCommands(context: TurnContext, state: TState): Promise<PredictedCommand[]> {
        // Request base prompt completion
        const promises: Promise<AxiosResponse<CreateCompletionResponse>>[] = [];
        promises.push(this._openai.createCompletion(await this.createCompletionRequest(context, state, this._options.prompt, this._options.promptConfig)) as any);
    
        // Add optional topic filter completion
        if (this._options.topicFilter) {
            if (!this._options.topicFilterConfig) {
                throw new Error(`OpenAIPredictionEngine: a "topicFilter" prompt was specified but the "topicFilterConfig" is missing.`);
            }
            promises.push(this._openai.createCompletion(await this.createCompletionRequest(context, state, this._options.topicFilter, this._options.topicFilterConfig)) as any);
        }

        // Wait for completions to finish
        const results = await Promise.all(promises);

        
        // Check topic filter
        if (results.length > 1) {
            // Look for the word "yes" to be in the topic filters response.
            let allowed = false;
            if (results[1]?.data?.choices && results[1].data.choices.length > 0) {
                allowed = results[1].data.choices[0].text.toLowerCase().indexOf('yes') >= 0;
            }

            // Block response if not allowed
            if (!allowed) {
                return [];
            }
        }

        // Parse returned prompt response
        console.log(JSON.stringify(results[0]?.data));
        if (results[0]?.data?.choices && results[0].data.choices.length > 0) {
            // Remove response prefix
            let response = results[0].data.choices[0].text;
            if (this._options?.conversationHistory?.botPrefix && response.toLowerCase().startsWith(this._options.conversationHistory.botPrefix.toLowerCase())) {
                response = response.substring(this._options.conversationHistory.botPrefix.length);
            }

            // Update conversation history
            ConversationHistoryTracker.updateHistory(context, state, response, this._options.conversationHistory);

            // Parse response into commands
            const commands = ResponseParser.parseResponse(response.trim());
            return commands;
        }

        return [];
    }

    private async createCompletionRequest(context: TurnContext, state: TState, prompt: PromptTemplate, config: CreateCompletionRequest): Promise<CreateCompletionRequest> {
        // Clone prompt config
        const request = Object.assign({}, config);

        // Expand prompt template
        request.prompt = await PromptParser.expandPromptTemplate(context, state, prompt);
        console.log(`prompt: ${request.prompt}`);

        return request;
    }
}
