/**
 * @module botbuilder-ai
 */
/** second comment block */
import { SearchEngine } from 'botbuilder';
export interface QnAMakerResult {
    answer: string;
    score: number;
}
export interface QnAMakerOptions {
    knowledgeBaseId: string;
    subscriptionKey: string;
    scoreThreshold: number;
    searchEngine: SearchEngine;
    top: number;
}
export declare class QnAMaker {
    private options;
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
