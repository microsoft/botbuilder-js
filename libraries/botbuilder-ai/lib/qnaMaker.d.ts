/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware } from 'botbuilder';
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
    /**
     * (Optional) and only applied when a QnAMaker instance has been added to ths adapter as
     * middleware.
     *
     * @remarks
     * Defaults to a value of `false`.
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
 * Manages querying an individual QnA Maker knowledge base for answers. Can be added as middleware
 * to automatically query the knowledge base anytime a messaged is received from the user. When
 * used as middleware the component can be configured to either query the knowledge base before the
 * bots logic runs or after the bots logic is run, as a fallback in the event the bot doesn't answer
 * the user.
 */
export declare class QnAMaker implements Middleware {
    private readonly endpoint;
    private readonly options;
    /**
     * Creates a new QnAMaker instance.
     * @param endpoint The endpoint of the knowledge base to query.
     * @param options (Optional) additional settings used to configure the instance.
     */
    constructor(endpoint: QnAMakerEndpoint, options?: QnAMakerOptions);
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    /**
     * Calls [generateAnswer()](#generateanswer) and sends the answer as a message ot the user.
     *
     * @remarks
     * Returns a value of `true` if an answer was found and sent. If multiple answers are
     * returned the first one will be delivered.
     * @param context Context for the current turn of conversation with the use.
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
}
