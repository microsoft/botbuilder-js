/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SearchEngine } from 'botbuilder';
export interface QnAMakerResult {
    answer: string;
    score: number;
}
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
export declare class QnAMaker {
    private readonly options;
    private catalog?;
    private kbUrl;
    private answerUrl;
    private kbTrainUrl;
    constructor(options: QnAMakerOptions);
    getAnswers(question: string): Promise<QnAMakerResult[]>;
    private getSearchEngineAnswers(question);
    private getServiceAnswers(question);
    /** build catalog */
    private createCatalogForKnowledgeBase();
    routeTo(context: BotContext): Promise<boolean>;
}
