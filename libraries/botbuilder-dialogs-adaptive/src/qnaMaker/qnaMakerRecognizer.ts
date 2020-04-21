/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext } from 'botbuilder-dialogs';
import { RecognizerResult, Activity } from 'botbuilder-core';
import { RankerTypes, QnAMakerMetadata, QnAMaker, QnAMakerEndpoint, QnAMakerOptions, QnAMakerResult, QnARequestContext } from 'botbuilder-ai';
import { Recognizer } from '../recognizers/recognizer';
import { StringExpression, IntExpression, NumberExpression, BoolExpression, ArrayExpression, ObjectExpression } from '../expressions';

const intentPrefix = 'intent=';

export class QnAMakerRecognizer implements Recognizer {
    public static readonly qnaMatchIntent = 'QnAMatch';
    
    /**
     * Id of the recognizer.
     */
    public id: string;

    /**
     * Knowledgebase id of your QnA maker knowledgebase.
     */
    public knowledgeBaseId: StringExpression;

    /**
     * Host name of the QnA maker knowledgebase.
     */
    public hostname: StringExpression;

    /**
     * Endpoint key for the QnA service.
     */
    public endpointKey: StringExpression;

    /**
     * Number of results you want.
     */
    public top: IntExpression = new IntExpression(3);

    /**
     * Threshold for the results.
     */
    public threshold: NumberExpression = new NumberExpression(0.3);

    /**
     * A value indicating whether to call test or prod environment of knowledgebase.
     */
    public isTest: boolean;

    /**
     * Desired RankerType.
     */
    public rankerType: StringExpression = new StringExpression(RankerTypes.default);

    /**
     * Whether to include the dialog name metadata for QnA context.
     */
    public includeDialogNameInMetadata: BoolExpression = new BoolExpression(true);

    /**
     * An expression to evaluate to set additional metadata name value pairs.
     */
    public metadata: ArrayExpression<QnAMakerMetadata>;

    /**
     * An expression to evaluate to set the context.
     */
    public context: ObjectExpression<QnARequestContext>;

    /**
     * An expression to evaluate to set QnAId parameter.
     */
    public qnaId: IntExpression = new IntExpression(0);

    public constructor(hostname?: string, knowledgeBaseId?: string, endpointKey?: string) {
        if (hostname) { this.hostname = new StringExpression(hostname); }
        if (knowledgeBaseId) { this.knowledgeBaseId = new StringExpression(knowledgeBaseId); }
        if (endpointKey) { this.endpointKey = new StringExpression(endpointKey); }
    }

    public async recognize(dc: DialogContext, activity: Activity): Promise<RecognizerResult> {
        // identify matched intents
        const recognizerResult: RecognizerResult = {
            text: activity.text,
            intents: {},
            entities: {}
        };

        if (!activity.text) {
            recognizerResult.intents['None'] = { score: 1 };
            return recognizerResult;
        }

        const filters: QnAMakerMetadata[] = [];
        if (this.includeDialogNameInMetadata && this.includeDialogNameInMetadata.getValue(dc.state)) {
            const metadata: QnAMakerMetadata = {
                name: 'dialogName',
                value: dc.activeDialog && dc.activeDialog.id
            };
            filters.push(metadata);
        }

        // if there is $qna.metadata set add to filters
        const externalMetadata: QnAMakerMetadata[] = this.metadata && this.metadata.getValue(dc.state);
        if (externalMetadata) {
            filters.push(...externalMetadata);
        }

        // calling QnAMaker to get response
        const qnaMaker = this.getQnAMaker(dc);
        const qnaMakerOptions: QnAMakerOptions = {
            context: this.context && this.context.getValue(dc.state),
            scoreThreshold: this.threshold && this.threshold.getValue(dc.state),
            strictFilters: filters,
            top: this.top && this.top.getValue(dc.state),
            qnaId: this.qnaId && this.qnaId.getValue(dc.state),
            rankerType: this.rankerType && this.rankerType.getValue(dc.state),
            isTest: this.isTest
        };
        const answers = await qnaMaker.getAnswers(dc.context, qnaMakerOptions);

        if (answers && answers.length > 0) {
            let topAnswer: QnAMakerResult;
            for (let i = 0; i < answers.length; i++) {
                const answer = answers[i];
                if (!topAnswer || (answer.score > topAnswer.score)) {
                    topAnswer = answer;
                }
            }

            if (topAnswer.answer.trim().toLowerCase().startsWith(intentPrefix)) {
                recognizerResult.intents[topAnswer.answer.trim().substr(intentPrefix.length).trim()] = { score: topAnswer.score };
            } else {
                recognizerResult.intents[QnAMakerRecognizer.qnaMatchIntent] = { score: topAnswer.score };
            }

            recognizerResult.entities['answer'] = [topAnswer.answer];
            recognizerResult.entities['$instance'] = { answer: topAnswer };
            recognizerResult['answers'] = answers;
        } else {
            recognizerResult.intents['None'] = { score: 1 };
        }

        return recognizerResult;
    }

    protected getQnAMaker(dc: DialogContext): QnAMaker {
        const endpointKey = this.endpointKey && this.endpointKey.getValue(dc.state);
        const hostname = this.hostname && this.hostname.getValue(dc.state);
        const knowledgeBaseId = this.knowledgeBaseId && this.knowledgeBaseId.getValue(dc.state);

        const endpoint: QnAMakerEndpoint = {
            endpointKey: endpointKey,
            host: hostname,
            knowledgeBaseId: knowledgeBaseId
        };
        return new QnAMaker(endpoint);
    }
}