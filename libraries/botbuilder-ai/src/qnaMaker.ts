/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { SearchCatalog, SearchEngine, SearchHit } from 'botbuilder';
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

    /** (Optional) search engine */
    searchEngine?: SearchEngine;

    /** (Optional) service endpoint. Defaults to "https://westus.api.cognitive.microsoft.com" */
    serviceEndpoint?: string;

    /** (Optional) number of results to return. Defaults to "1". */
    top?: number;
}

export class QnAMaker {
    private readonly options: QnAMakerOptions; 
    private catalog?: SearchCatalog;
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
        if (this.options.searchEngine) {
            return this.getSearchEngineAnswers(question);
        }
        else {
            return this.getServiceAnswers(question);
        }
    }

    private async getSearchEngineAnswers(question: string): Promise<QnAMakerResult[]> {
        if (!this.options.searchEngine)
            throw new Error("No searchEngine was provided");

        if (!this.catalog) {
            this.catalog = await this.options.searchEngine.getCatalog(this.options.knowledgeBaseId)
                .catch(() => this.createCatalogForKnowledgeBase());
        }
        let searchHits = await this.catalog.search(question);
        var answers: QnAMakerResult[] = [];
        if (searchHits && searchHits.length > 0) {
            const scoreThreshold = this.options.scoreThreshold as number;
            const top = this.options.top as number;
            for (let searchHit of searchHits) {
                if (searchHit.score >= scoreThreshold) {
                    let doc: any = await this.catalog.get(searchHit.docId);
                    answers.push({
                        score: searchHit.score,
                        answer: doc.answer
                    });
                    if (answers.length >= top)
                        break;
                }
            }
            ;
        }
        return answers;
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


    /** build catalog */
    private async createCatalogForKnowledgeBase(): Promise<SearchCatalog> {
        // create empty catalog
        let catalog = await (this.options.searchEngine as SearchEngine).createCatalog(this.options.knowledgeBaseId, "qnaId", ["question", "answer"]);

        // get knowledge base
        let knowledgeBase = await request({
            url: this.kbUrl,
            method: 'GET',
            headers: {'Ocp-Apim-Subscription-Key': this.options.subscriptionKey}
        }).then((result) => <QnAKnowledgeBase>JSON.parse(result));

        // proces each line
        for (let qna of knowledgeBase.qnaList) {

            // index question/answer as a document
            catalog.add({
                qnaId: qna.qnaId,
                question: qna.questions.join('\n'),
                answer: qna.answer
            });
        }
        // flush changes
        await catalog.flush();
        return catalog;
    }

    routeTo(context: BotContext): Promise<boolean> {
        if (context.request && context.request.text && context.request.text.length > 0) {
            return this
                .getAnswers(context.request.text)
                .then((answers) => {
                    if (answers.length > 0) {
                        let answer = answers[0];
                        // send reply as response
                        context.reply(answer.answer);
                        return true;
                    }
                    // no result found
                    return false;
                }).catch(error => {
                    // failure
                    return Promise.reject(error);
                })
        }
        // no result
        return Promise.resolve(false);
    }
}



