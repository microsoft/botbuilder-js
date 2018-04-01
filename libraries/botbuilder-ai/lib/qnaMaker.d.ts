/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware } from 'botbuilder';
export interface QnAMakerResult {
    answer: string;
    score: number;
}
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
export declare class QnAMaker implements Middleware {
    private readonly settings;
    constructor(settings: QnAMakerSettings);
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    /**
     * Calls [generateAnswer()](#generateanswer) and sends the answer as a message ot the user.
     * Returns a value of `true` if an answer was found and sent. If multiple answers are
     * returned the first one will be delivered.
     * @param context Context for the current turn of conversation with the use.
     */
    answer(context: TurnContext): Promise<boolean>;
    /**
     * Calls the QnA Maker service to generate answer(s) for a question. The returned answers will
     * be sorted by score with the top scoring answer returned first.
     * @param question The question to answer.
     * @param top (Optional) number of answers to return. Defaults to a value of `1`.
     * @param scoreThreshold (Optional) minimum answer score needed to be considered a match to questions. Defaults to a value of `0.001`.
     */
    generateAnswer(question: string | undefined, top?: number, scoreThreshold?: number): Promise<QnAMakerResult[]>;
    protected callService(serviceEndpoint: string, question: string, top: number): Promise<QnAMakerResult[]>;
}
