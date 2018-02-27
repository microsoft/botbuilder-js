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
    /** (Optional) service endpoint. Defaults to "https://westus.api.cognitive.microsoft.com" */
    serviceEndpoint?: string;
    /** (Optional) number of results to return. Defaults to "1". */
    top?: number;
}
export declare class QnAMaker {
    private readonly options;
    private kbUrl;
    private answerUrl;
    private kbTrainUrl;
    constructor(options: QnAMakerOptions);
    getAnswers(question: string): Promise<QnAMakerResult[]>;
    private getServiceAnswers(question);
}
