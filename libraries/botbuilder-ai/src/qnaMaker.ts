/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { BotContext } from 'botbuilder';
import * as request from 'request-promise-native';
import * as entities from 'html-entities';

var htmlentities = new entities.AllHtmlEntities();

export interface QnAMakerResult {
    answer: string,
    score: number
}

interface QnA {
    qnaId: string;
    source: string;
    answer: string;
    questions: string[];
    metadata: any[]
}

interface QnAKnowledgeBase {
    qnaList: QnA[];
}

const v3path = '/qnamaker/v3.0/knowledgebases/';

export interface QnAMakerOptions {
    /** ID of your knowledge base. */
    knowledgeBaseId: string;

    /** Your subscription keys. */
    subscriptionKey: string;

    /** (Optional) minimum score accepted. Defaults to "0.3". */
    scoreThreshold?: number;

    /** (Optional) service endpoint. Defaults to "https://westus.api.cognitive.microsoft.com" */
    serviceEndpoint?: string;

    /** (Optional) number of results to return. Defaults to "1". */
    top?: number;
}

export class QnAMaker {
    private readonly options: QnAMakerOptions; 
    private kbUrl: string;
    private answerUrl: string;
    private kbTrainUrl: string;

    constructor(options: QnAMakerOptions) {
        this.options = Object.assign({
            scoreThreshold: 0.3,
            serviceEndpoint: 'https://westus.api.cognitive.microsoft.com',
            top: 1
        } as QnAMakerOptions, options);

        const endpoint = this.options.serviceEndpoint as string;
        this.kbUrl = `${endpoint + v3path + options.knowledgeBaseId}`;
        this.answerUrl = `${this.kbUrl}/generateanswer`;
        this.kbTrainUrl = `${this.kbUrl}/train`;
    }

    public getAnswers(question: string): Promise<QnAMakerResult[]> {
        return this.getServiceAnswers(question);
    }
    private getServiceAnswers(question: string): Promise<QnAMakerResult[]> {
        return request({
            url: this.answerUrl,
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': this.options.subscriptionKey
            },
            json: {
                question: question,
                top: this.options.top
            }
        })
            .then(result => {
                const answers: QnAMakerResult[] = [];
                const scoreThreshold = this.options.scoreThreshold as number;
                if (result.answers && result.answers.length > 0) {
                    result.answers.forEach((ans: any) => {
                        ans.score /= 100;
                        if (ans.score >= scoreThreshold ) {
                            answers.push({
                                score: ans.score,
                                answer: htmlentities.decode(ans.answer)
                            });
                        }
                    });
                }
                return answers;
            });
    }
}



