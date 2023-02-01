/**
 * @module botbuilder-m365
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { PredictedCommand, PredictionEngine } from './PredictionEngine';
import { TurnState } from './TurnState';
import { DefaultTurnState } from './DefaultTurnStateManager';
import { TurnContext } from 'botbuilder-core';
import { Configuration, ConfigurationParameters, OpenAIApi, CreateCompletionRequest, CreateCompletionResponse } from 'openai';
import { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { ResponseParser } from './ResponseParser';
import { PromptParser, PromptTemplate } from './PromptParser';
import { ConversationHistoryOptions, ConversationHistoryTracker } from './ConversationHistoryTracker';
import { Application } from './Application';


export interface OpenAIPredictionEngineOptions extends OpenAIPredictionOptions {
    configuration: ConfigurationParameters;
    basePath?: string;
    axios?: AxiosInstance;
}

export interface OpenAIPredictionOptions {
    prompt: PromptTemplate;
    promptConfig: CreateCompletionRequest;
    topicFilter?: PromptTemplate; 
    topicFilterConfig?: CreateCompletionRequest;
}

export class OpenAIPredictionEngine<TState extends TurnState = DefaultTurnState> implements PredictionEngine<TState, OpenAIPredictionOptions> {
    private readonly _options: OpenAIPredictionEngineOptions;
    private readonly _configuration: Configuration;
    private readonly _openai: OpenAIApi;
    private readonly _prompts = new Map<string, CreateCompletionRequest>();


    public constructor(options?: OpenAIPredictionEngineOptions) {
        this._options = Object.assign({} as OpenAIPredictionEngineOptions, options);
        this._configuration = new Configuration(options.configuration);
        this._openai = new OpenAIApi(this._configuration, options.basePath, options.axios as any);
    }

    public get configuration(): Configuration {
        return this._configuration;
    }

    public get openai(): OpenAIApi {
        return this._openai;
    }

    public async predictCommands(app: Application, context: TurnContext, state: TState, data?: Record<string, any>, options?: OpenAIPredictionOptions): Promise<PredictedCommand[]> {
        data = data ?? {};
        options = options ?? this._options;
    

        // Request base prompt completion
        const promises: Promise<AxiosResponse<CreateCompletionResponse>>[] = [];
        promises.push(this._openai.createCompletion(await this.createCompletionRequest(app, context, state, data, options.prompt, options.promptConfig)) as any);
    
        // Add optional topic filter completion
        if (options.topicFilter) {
            if (!options.topicFilterConfig) {
                throw new Error(`OpenAIPredictionEngine: a "topicFilter" prompt was specified but the "topicFilterConfig" is missing.`);
            }

            promises.push(this._openai.createCompletion(await this.createCompletionRequest(app, context, state, data, options.topicFilter, options.topicFilterConfig)) as any);
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
            const historyOptions = ConversationHistoryTracker.getOptions(app.options.conversationHistory);
            if (historyOptions.botPrefix && response.toLowerCase().startsWith(historyOptions.botPrefix.toLowerCase())) {
                response = response.substring(historyOptions.botPrefix.length);
            }

            // Parse response into commands
            const commands = ResponseParser.parseResponse(response.trim());
            return commands;
        }

        return [];
    }

    private async createCompletionRequest(app: Application, context: TurnContext, state: TState, data: Record<string, any>, prompt: PromptTemplate, config: CreateCompletionRequest): Promise<CreateCompletionRequest> {
        // Clone prompt config
        const request = Object.assign({}, config);

        // Expand prompt template
        request.prompt = await PromptParser.expandPromptTemplate(app, context, state, data, prompt);
        console.log(`prompt: ${request.prompt}`);

        return request;
    }
}
