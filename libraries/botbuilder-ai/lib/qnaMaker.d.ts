/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity } from 'botbuilder';
/**
 * An individual answer returned by `QnAMaker.generateAnswer()`.
 */
export interface QnAMakerResult {
    /** The list of questions indexed in the QnA Service for the given answer. */
    questions?: string[];
    /** Answer from the knowledge base.  */
    answer: string;
    /** Confidence on a scale from 0.0 to 1.0 that the answer matches the users intent. */
    score: number;
    /** Metadata associated with the answer */
    metadata?: any;
    /** The source from which the QnA was extracted */
    source?: string;
    /** The index of the answer in the knowledge base. V3 uses 'qnaId', V4 uses 'id'.*/
    id?: number;
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
    /**
     * (Optional) minimum score accepted.
     *
     * @remarks
     * Defaults to "0.3".
     */
    scoreThreshold?: number;
    /**
     * (Optional) number of results to return.
     *
     * @remarks
     * Defaults to "1".
     */
    top?: number;
}
/**
 * Trace info that we collect and emit from a QnA Maker query
 */
export interface QnAMakerTraceInfo {
    /** Message which instigated the query to QnA Maker */
    message: Activity;
    /** Results that QnA Maker returned */
    queryResults: QnAMakerResult[];
    /** ID of the knowledge base that is being queried */
    knowledgeBaseId: string;
    /** The minimum score threshold, used to filter returned results */
    scoreThreshold: number;
    /** Number of ranked results that are asked to be returned */
    top: number;
    /** Filters used on query. Not used in JavaScript SDK v4 yet */
    strictFilters: any[];
    /** Metadata related to query. Not used in JavaScript SDK v4 yet */
    metadataBoost: any[];
}
/**
 * Manages querying an individual QnA Maker knowledge base for answers.
 */
export declare class QnAMaker {
    private readonly endpoint;
    private readonly options;
    /**
     * Creates a new QnAMaker instance.
     * @param endpoint The endpoint of the knowledge base to query.
     * @param options (Optional) additional settings used to configure the instance.
     */
    constructor(endpoint: QnAMakerEndpoint, options?: QnAMakerOptions);
    /**
     * Calls [generateAnswer()](#generateanswer) and sends the answer as a message to the user.
     *
     * @remarks
     * Returns a value of `true` if an answer was found and sent. If multiple answers are
     * returned the first one will be delivered.
     * @param context Context for the current turn of conversation with the user.
     */
    answer(context: TurnContext): Promise<boolean>;
    /**
     * Calls the QnA Maker service to generate answer(s) for a question.
     *
     * @remarks
     * The returned answers will be sorted by score with the top scoring answer returned first.
     * @param question The question to answer.
     * @param top (Optional) number of answers to return. Defaults to a value of `1`.
     * @param scoreThreshold (Optional) minimum answer score needed to be considered a match to questions. Defaults to a value of `0.001`.
     */
    generateAnswer(question: string | undefined, top?: number, scoreThreshold?: number): Promise<QnAMakerResult[]>;
    /**
     * Called internally to query the QnA Maker service.
     *
     * @remarks
     * This is exposed to enable better unit testing of the service.
     */
    protected callService(endpoint: QnAMakerEndpoint, question: string, top: number): Promise<QnAMakerResult[]>;
    /**
     * Emits a trace event detailing a QnA Maker call and its results.
     *
     * @param context Context for the current turn of conversation with the user.
     * @param answers Answers returned by QnA Maker.
     */
    private emitTraceInfo(context, answers);
}
