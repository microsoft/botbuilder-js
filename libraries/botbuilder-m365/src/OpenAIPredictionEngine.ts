import { PredictedCommand, PredictionEngine } from './PredictionEngine';
import { TurnState } from './TurnState';
import { DefaultTurnState } from './DefaultTurnStateManager';
import { TurnContext } from 'botbuilder-core';
import { Configuration, ConfigurationParameters, OpenAIApi, CreateCompletionRequest, CreateCompletionResponse } from 'openai';
import { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { readFile } from 'fs/promises';
import { ResponseParser } from './internals';


export type PromptTemplate<TState extends TurnState> = string|((context: TurnContext, state: TState) => Promise<string>);
export interface OpenAIPredictionEngineOptions<TState extends TurnState> {
    configuration: ConfigurationParameters;
    basePath?: string;
    axios?: AxiosInstance;
    prompt: PromptTemplate<TState>;
    promptConfig: CreateCompletionRequest;
    topicFilter?: PromptTemplate<TState>; 
    topicFilterConfig?: CreateCompletionRequest;   
}

export class OpenAIPredictionEngine<TState extends TurnState = DefaultTurnState> implements PredictionEngine<TState> {
    private readonly _options: OpenAIPredictionEngineOptions<TState>;
    private readonly _configuration: Configuration;
    private readonly _openai: OpenAIApi;
    private readonly _prompts = new Map<string, CreateCompletionRequest>();


    public constructor(options?: OpenAIPredictionEngineOptions<TState>) {
        this._options = Object.assign({}, options);
        this._configuration = new Configuration(options.configuration);
        this._openai = new OpenAIApi(this._configuration, options.basePath, options.axios as any);
    }

    public get configuration(): Configuration {
        return this._configuration;
    }

    public get openai(): OpenAIApi {
        return this._openai;
    }

    public async expandPromptTemplate(context: TurnContext, state: TState, prompt: PromptTemplate<TState>): Promise<string> {
        // Get template
        let promptTemplate: string;
        if (typeof prompt == 'function') {
            promptTemplate = await prompt(context, state);
        } else {
            promptTemplate = await readFile(prompt, { encoding: 'utf8' });
        }

        // Expand template
        let variableName: string;
        let parseState = PromptParseState.inText;
        let outputPrompt = '';
        for (let i = 0; i < promptTemplate.length; i++) {
            const ch = promptTemplate[i];
            switch (parseState) {
                case PromptParseState.inText:
                default:
                    if (ch == '{' && (i+1) < promptTemplate.length && promptTemplate[i+1] == '{') {
                        // Skip next character and change parse state
                        i++;
                        variableName = '';
                        parseState = PromptParseState.inVariable;
                    } else {
                        // Append character to output
                        outputPrompt += ch;
                    }
                    break;
                case PromptParseState.inVariable:
                    if (ch == '}') {
                        // Skip next character
                        if ((i+1) < promptTemplate.length && promptTemplate[i+1] == '}') {
                            i++;
                        }

                        // Append variable contents to output
                        outputPrompt += this.lookupPromptVariable(context, state, variableName);
                    } else {
                        // Append character to variable name
                        variableName += ch;
                    }
                    break;
            }
        }

        return outputPrompt;
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
        if (results[0]?.data?.choices && results[0].data.choices.length > 0) {
            const response = results[0].data.choices[0].text;
            const commands = ResponseParser.parseResponse(response);
            return commands;
        }

        return [];
    }

    private lookupPromptVariable(context: TurnContext, state: TState, variableName: string): string {
        // Split variable name into parts and validate
        // TODO: Add support for longer dotted path variable names
        const parts = variableName.trim().split('.');
        if (parts.length != 2) {
            throw new Error(`OpenAIPredictionEngine: invalid variable name of "${variableName}" specified`);
        }

        // Check for special cased variables first
        switch (parts[0]) {
            case 'activity':
                // Return activity field
                return (context.activity as any)[parts[1]] ?? '';
            default:
                // Find referenced state entry
                const entry = state[parts[0]];
                if (!entry) {
                    throw new Error(`OpenAIPredictionEngine: invalid variable name of "${variableName}" specified. Couldn't find a state named "${parts[0]}".`);
                }

                // Return state field
                return entry.value[parts[1]];
        }
    }

    private async createCompletionRequest(context: TurnContext, state: TState, prompt: PromptTemplate<TState>, config: CreateCompletionRequest): Promise<CreateCompletionRequest> {
        // Clone prompt config
        const request = Object.assign({}, config);

        // Expand prompt template
        request.prompt = await this.expandPromptTemplate(context, state, prompt);

        return request;
    }
}

enum PromptParseState { inText, inVariable }

