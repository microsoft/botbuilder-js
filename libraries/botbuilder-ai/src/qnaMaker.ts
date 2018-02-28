/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { BotContext, Middleware } from 'botbuilder';
import * as request from 'request-promise-native';
import * as entities from 'html-entities';

var htmlentities = new entities.AllHtmlEntities();

export interface QnAMakerResult {
    answer: string;
    score: number;
}

const GENERATEANSWER_PATH = '/qnamaker/v3.0/knowledgebases/generateanswer';

export interface QnAMakerSettings {
    /** ID of your knowledge base. */
    knowledgeBaseId: string;

    /** Your subscription keys. */
    subscriptionKey: string;

    /** (Optional) minimum score accepted. Defaults to "0.3". */
    scoreThreshold?: number;

    /** (Optional) service endpoint. Defaults to "https://westus.api.cognitive.microsoft.com/" */
    serviceEndpoint?: string;

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

export class QnAMaker implements Middleware {
    private readonly settings: QnAMakerSettings; 

    constructor(settings: QnAMakerSettings) {
        this.settings = Object.assign({
            scoreThreshold: 0.3,
            top: 1,
            answerBeforeNext: false
        } as QnAMakerSettings, settings);
        if (!this.settings.serviceEndpoint) {
            this.settings.serviceEndpoint =  'https://westus.api.cognitive.microsoft.com/';
        } else if (!this.settings.serviceEndpoint.endsWith('/')) {
            this.settings.serviceEndpoint += '/';
        }
    }

    public onProcessRequest(context: BotContext, next: () => Promise<void>): Promise<void> {
        if (this.settings.answerBeforeNext) {
            // Attempt to answer user and only call next() if not answered
            return this.answer(context)
                .then((answered) => !answered ? next() : Promise.resolve());
        } else {
            // Call next() and then attempt to answer only if nothing else responded
            return next()
                .then(() => !context.responded ? this.answer(context).then(() => {}) : Promise.resolve());
        }
    }

    public answer(context: BotContext): Promise<boolean> {
        const { top, scoreThreshold } = this.settings;
        return this.generateAnswer(context.request.text, top, scoreThreshold).then((answers) => {
            if (answers.length > 0) {
                return context.sendActivities({ text: answers[0].answer, type: 'message' }).then(() => true);
            } else {
                return Promise.resolve(false);
            }
        });

    }

    public generateAnswer(question: string, top?: number, scoreThreshold?: number): Promise<QnAMakerResult[]> {
        const { serviceEndpoint } = this.settings;
        return this.callService(serviceEndpoint as string, question, typeof top === 'number' ? top : 1).then((answers) => {
            const minScore = typeof scoreThreshold === 'number' ? scoreThreshold : 0.0;
            return answers.filter((ans) => ans.score >= minScore).sort((a, b) => b.score - a.score);
        });
    }

    protected callService(serviceEndpoint: string, question: string, top: number): Promise<QnAMakerResult[]> {
        return request({
            url: serviceEndpoint + GENERATEANSWER_PATH,
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': this.settings.subscriptionKey
            },
            json: {
                question: question,
                top: top
            }
        }).then(result => {
            const answers: QnAMakerResult[] = [];
            return ((result.answers || []) as QnAMakerResult[]).map((ans) => { 
                return { score: ans.score / 100, answer: htmlentities.decode(ans.answer) }  as QnAMakerResult;
            });
        });
    }
}
