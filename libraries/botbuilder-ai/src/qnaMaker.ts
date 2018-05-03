/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware, ActivityTypes } from 'botbuilder';
import * as request from 'request-promise-native';
import * as entities from 'html-entities';

/**
 * @private
 */
const htmlentities = new entities.AllHtmlEntities();

/**
 * An individual answer returned by `QnAMaker.generateAnswer()`.
 */
export interface QnAMakerResult {
    /** Answer from the knowledge base.  */
    answer: string;

    /** Confidence on a scale from 0.0 to 1.0 that the answer matches the users intent. */
    score: number;
}

/**
 * Defines an endpoint used to connect to a QnA Maker Knowledge base.
 */
export interface QnAMakerEndpoint {
    /** 
     * ID of your knowledge base. For example: `98185f59-3b6f-4d23-8ebb-XXXXXXXXXXXX` 
     */
    knowledgeBaseId: string;

    /** 
     * Your endpoint key. For `v2` or `v3` knowledge bases this is your subscription key. 
     * For example: `4cb65a02697745eca369XXXXXXXXXXXX` 
     */
    endpointKey: string;

    /** 
     * The host path. For example: `https://westus.api.cognitive.microsoft.com/qnamaker/v2.0` 
     */
    host: string;    
}

/**
 * Additional settings used to configure a `QnAMaker` instance.
 */
export interface QnAMakerOptions {

    /** (Optional) minimum score accepted. Defaults to "0.3". */
    scoreThreshold?: number;

    /** (Optional) number of results to return. Defaults to "1". */
    top?: number;

    /** 
     * (Optional) and only applied when a QnAMaker instance has been added to ths adapter as 
     * middleware. Defaults to a value of `false`.
     * 
     * Setting this to `true` will cause the QnA Maker service to be called BEFORE any other 
     * middleware or the bots logic is run. Should the service return an answer the user will be 
     * automatically sent the answer and the turn completed such that no other middleware or the 
     * bots logic will be run.
     * 
     * The default behavior is to only call the service AFTER all other middleware and the bots logic 
     * has run, and only under the condition that no other replies have been sent by the bot yet 
     * for this turn.
     */
    answerBeforeNext?: boolean;
}

/**
 * @private
 */
const ENDPOINT_REGEXP = /\/knowledgebases\/(.*)\/generateAnswer\r\nHost:\s(.*)\r\n.*(?:EndpointKey|Ocp-Apim-Subscription-Key:)\s(.*)\r\n/i;

/**
 * @private
 */
const UNIX_ENDPOINT_REGEXP = /\/knowledgebases\/(.*)\/generateAnswer\nHost:\s(.*)\n.*(?:EndpointKey|Ocp-Apim-Subscription-Key:)\s(.*)\n/i;

/**
 * Manages querying an individual QnA Maker knowledge base for answers. Can be added as middleware 
 * to automatically query the knowledge base anytime a messaged is received from the user. When 
 * used as middleware the component can be configured to either query the knowledge base before the
 * bots logic runs or after the bots logic is run, as a fallback in the event the bot doesn't answer 
 * the user.   
 */
export class QnAMaker implements Middleware {
    private readonly endpoint: QnAMakerEndpoint;
    private readonly options: QnAMakerOptions; 

    /**
     * Creates a new QnAMaker instance.  You can initialize the endpoint for the instance by 
     * passing in the publishing endpoint provided in the QnA Maker portal.
     * 
     * For version 2 this looks like:
     * 
     * ```JS
     * POST /knowledgebases/98185f59-3b6f-4d23-8ebb-XXXXXXXXXXXX/generateAnswer
     * Host: https://westus.api.cognitive.microsoft.com/qnamaker/v2.0
     * Ocp-Apim-Subscription-Key: 4cb65a02697745eca369XXXXXXXXXXXX
     * Content-Type: application/json
     * {"question":"hi"}
     * ```
     * 
     * And for the new version 4 this looks like:
     * 
     * ```JS
     * POST /knowledgebases/d31e049e-2557-463f-a0cc-XXXXXXXXXXXX/generateAnswer
     * Host: https://test-knowledgebase.azurewebsites.net/qnamaker
     * Authorization: EndpointKey 16cdca0b-3826-4a0f-a112-XXXXXXXXXXXX
     * Content-Type: application/json
     * {"question":"<Your question>"}
     * ```
     * @param endpoint The endpoint of the knowledge base to query.
     * @param options (Optional) additional settings used to configure the instance.
     */
    constructor(endpoint: QnAMakerEndpoint|string, options?: QnAMakerOptions) {
        // Initialize endpoint
        if (typeof endpoint === 'string') {
            // Parse endpoint
            let matched = ENDPOINT_REGEXP.exec(endpoint);
            if (!matched) { matched = UNIX_ENDPOINT_REGEXP.exec(endpoint) }
            if (!matched) { throw new Error(`QnAMaker: invalid endpoint of "${endpoint}" passed to constructor.`) }
            this.endpoint = {
                knowledgeBaseId: matched[1],
                host: matched[2],
                endpointKey: matched[3]
            };
        } else {
            this.endpoint = endpoint;
        }

        // Initialize options
        this.options = Object.assign({
            scoreThreshold: 0.3,
            top: 1,
            answerBeforeNext: false
        } as QnAMakerOptions, options);
    }

    public onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        // Filter out non-message activities
        if (context.activity.type !== ActivityTypes.Message) {
            return next();
        }

        // Route request
        if (this.options.answerBeforeNext) {
            // Attempt to answer user and only call next() if not answered
            return this.answer(context).then((answered) => {
                return !answered ? next() : Promise.resolve()
            });
        } else {
            // Call next() and then attempt to answer only if nothing else responded
            return next().then(() => {
                return !context.responded ? this.answer(context).then(() => {}) : Promise.resolve()
            });
        }
    }

    /**
     * Calls [generateAnswer()](#generateanswer) and sends the answer as a message ot the user. 
     * Returns a value of `true` if an answer was found and sent. If multiple answers are 
     * returned the first one will be delivered.
     * @param context Context for the current turn of conversation with the use.
     */
    public answer(context: TurnContext): Promise<boolean> {
        const { top, scoreThreshold } = this.options;
        return this.generateAnswer(context.activity.text, top, scoreThreshold).then((answers) => {
            if (answers.length > 0) {
                return context.sendActivity({ text: answers[0].answer, type: 'message' }).then(() => true);
            } else {
                return Promise.resolve(false);
            }
        });

    }

    /**
     * Calls the QnA Maker service to generate answer(s) for a question. The returned answers will
     * be sorted by score with the top scoring answer returned first.
     * @param question The question to answer.
     * @param top (Optional) number of answers to return. Defaults to a value of `1`.
     * @param scoreThreshold (Optional) minimum answer score needed to be considered a match to questions. Defaults to a value of `0.001`.
     */
    public generateAnswer(question: string|undefined, top?: number, scoreThreshold?: number): Promise<QnAMakerResult[]> {
        const q = question ? question.trim() : ''; 
        if (q.length > 0) {
            return this.callService(this.endpoint, question, typeof top === 'number' ? top : 1).then((answers) => {
                const minScore = typeof scoreThreshold === 'number' ? scoreThreshold : 0.001;
                return answers.filter((ans) => ans.score >= minScore).sort((a, b) => b.score - a.score);
            });
        }
        return Promise.resolve([]);
    }

    protected callService(endpoint: QnAMakerEndpoint, question: string, top: number): Promise<QnAMakerResult[]> {
        const url = `${endpoint.host}/knowledgebases/${endpoint.knowledgeBaseId}/generateanswer`;
        const headers: any = {};
        if (endpoint.host.endsWith('v2.0') || endpoint.host.endsWith('v3.0')) {
            headers['Ocp-Apim-Subscription-Key'] = endpoint.endpointKey;
        } else {
            headers['Authorization'] = `EndpointKey ${endpoint.endpointKey}`;
        }
        return request({
            url: url,
            method: 'POST',
            headers: headers,
            json: {
                question: question,
                top: top
            }
        }).then(result => {
            const answers: QnAMakerResult[] = [];
            return (result.answers as QnAMakerResult[]).map((ans) => { 
                return { score: ans.score / 100, answer: htmlentities.decode(ans.answer) }  as QnAMakerResult;
            });
        });
    }
}
