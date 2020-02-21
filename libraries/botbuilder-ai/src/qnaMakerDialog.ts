/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes } from 'botbuilder-core';
import { WaterfallDialog, Dialog, DialogTurnResult, DialogContext, WaterfallStepContext, DialogTurnStatus, DialogReason } from 'botbuilder-dialogs';
import { QnAMakerOptions } from './qnamaker-interfaces/qnamakerOptions';
import { RankerTypes } from './qnamaker-interfaces/rankerTypes';
import { QnAMaker, QnAMakerResult } from './';
import { FeedbackRecord, FeedbackRecords } from './qnamaker-interfaces';

export interface QnAMakerDialogResponseOptions {
    activeLearningCardTitle: string;
    cardNoMatchText: string;
    noAnswer: Activity;
    cardNoMatchResponse: Activity;
}

export interface QnAMakerDialogOptions {
    qnaMakerOptions: QnAMakerOptions;
    qnaDialogResponseOptions: QnAMakerDialogResponseOptions;
}

export class QnAMakerDialog extends WaterfallDialog {
    
    private QnAContextData: string = 'previousContextData';
    private PreviousQnAId: string = 'previousQnAId';
    private Options: string = 'options';
    private QnAData: string = 'qnaData';
    private CurrentQuery: string = 'currentQuery';

    private DefaultCardTitle: string = "Did you mean:";
    private DefaultCardNoMatchText: string = "None of the above.";
    private DefaultCardNoMatchResponse: string = "Thanks for the feedback.";
    private DefaultNoAnswer: string = "No QnAMaker answers found.";

    private maximumScoreForLowScoreVariation: number;
    private knowledgeBaseId: any;
    private hostName: any;
    private endpointKey: any;
    private threshold: number;
    private top: number;
    private activeLearningCardTitle: string;
    private cardNoMatchText: string;
    private strintFilters: any;
    private noAnswer: any;
    private cardNoMatchResponse: any;

    constructor(knowledgeBaseId, endpointKey, hostName, noAnswer = null, threshold = 0.3, activeLearningCardTitle = 'Did you mean:', cardNoMatchText = 'None of the above.', top = 3, cardNoMatchResponse = null, strictFilters = null, dialogId = 'QnAMakerDialog') {
        super(dialogId);
        this.maximumScoreForLowScoreVariation = 0.95;
        this.knowledgeBaseId = knowledgeBaseId;
        this.hostName = hostName;
        this.endpointKey = endpointKey;
        this.threshold = threshold;
        this.top = top;
        this.activeLearningCardTitle = activeLearningCardTitle;
        this.cardNoMatchText = cardNoMatchText;
        this.strintFilters = strictFilters;
        this.noAnswer = noAnswer;
        this.cardNoMatchResponse = cardNoMatchResponse;

        this.addStep(this.callGenerateAnswer.bind(this));
        this.addStep(this.callTrain.bind(this));
        this.addStep(this.checkForMultiTurnPrompt.bind(this));
        this.addStep(this.displayQnAResult.bind(this));
    }

    public async beginDialog(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        if (!dc) { throw new Error('Missing DialogContext'); }
        
        if (dc.context.activity.type != ActivityTypes.Message) 
        { 
            return Dialog.EndOfTurn; 
        }

        var dialogOptions: QnAMakerDialogOptions = {
            qnaDialogResponseOptions: await this.getQnAResponseOptions(dc),
            qnaMakerOptions: await this.getQnAMakerOptions(dc)
        };

        if(options)
        {
            Object.assign(dialogOptions, options);
        }

        return await super.beginDialog(dc, dialogOptions);
    }

    private async getQnAMakerOptions(dc: DialogContext): Promise<QnAMakerOptions> {
        return {
            scoreThreshold: this.threshold,
            strictFilters: this.strintFilters,
            top: this.top,
            qnaId: 0,
            rankerType: RankerTypes.default,
            isTest: false
        };
    };
    
    private async getQnAResponseOptions(dc: DialogContext): Promise<QnAMakerDialogResponseOptions> {
        return {
            activeLearningCardTitle: this.activeLearningCardTitle,
            cardNoMatchResponse: this.cardNoMatchResponse,
            cardNoMatchText: this.cardNoMatchText,
            noAnswer: this.noAnswer
        };
    }

    private async callGenerateAnswer(step: WaterfallStepContext): Promise<DialogTurnResult> {
        const dialogOptions = step.activeDialog.state[this.Options];
        dialogOptions.qnaMakerOptions.qnaId = 0;
        dialogOptions.qnaMakerOptions.context = { previousQnAId: 0, previousUserQuery: '' };

        step.values[this.CurrentQuery] = step.context.activity.text;
        var previousContextData: { [key: string]: number } = {};
        var previousQnAId = 0;
        
        if (step.activeDialog.state.previousQnAId) {
            previousQnAId = step.activeDialog.state[this.PreviousQnAId];
        }
        
        if (step.activeDialog.state.previousContextData) {
            previousContextData = step.activeDialog.state[this.QnAContextData];
        }
        
        if (previousQnAId > 0) {
            dialogOptions.qnaMakerOptions.context = { previousQnAId: previousQnAId, previousUserQuery: '' };
            
            if (previousContextData[step.context.activity.text]) {
                dialogOptions.qnaMakerOptions.qnaId = previousContextData[step.context.activity.text];
            }
        }
        
        const qna = this.getQnAClient();
            
        const response = await qna.getAnswersRaw(step.context, dialogOptions.qnaMakerOptions);
            
        const qnaResponse = {
            activeLearningEnabled: response.activeLearningEnabled,
            answers: response.answers
        };

        previousQnAId = -1;
        step.activeDialog.state[this.PreviousQnAId] = previousQnAId;
        const isActiveLearningEnabled = qnaResponse.activeLearningEnabled;
        
        step.values[this.QnAData] = response.answers;
        
        if (isActiveLearningEnabled && qnaResponse.answers.length > 0 && qnaResponse.answers[0].score <= this.maximumScoreForLowScoreVariation) {
            qnaResponse.answers = qna.getLowScoreVariation(qnaResponse.answers);
            
            if (qnaResponse.answers && qnaResponse.answers.length > 1) {
                var suggestedQuestions;
                qnaResponse.answers.forEach(answer => {
                        suggestedQuestions.push(answer.questions[0]);
                });
            }
                
            //var message = QnACardBuilder
            await step.context.sendActivity('This is a placeholder until the cardholder is built');
            step.activeDialog.state[this.Options] = dialogOptions;
            
            return { status: DialogTurnStatus.waiting, result: undefined };
        }

        const result = [];
        
        if (response.answers && response.answers.length > 0) {
            result.push(response.answers[0]);
        }
        
        step.values[this.QnAData] = result;
        step.activeDialog.state[this.Options] = dialogOptions;
        return await step.next(result);
    }

    private async callTrain(step: WaterfallStepContext): Promise<DialogTurnResult> {
        const dialogOptions:QnAMakerDialogOptions = step.activeDialog.state[this.Options];
        const trainResponses:QnAMakerResult[] = step.values[this.QnAData];
        const currentQuery:string = step.values[this.CurrentQuery];

        const reply = step.context.activity.text;

        if(trainResponses.length > 1)
        {
            const qnaResult = trainResponses.filter(r => r.questions[0] == reply);

            if(qnaResult)
            {
                var results: QnAMakerResult[];
                results.push(qnaResult[0]);
                step.values[this.QnAData] = results;

                var records: FeedbackRecord[];
                records.push({
                    userId: step.context.activity.id,
                    userQuestion: currentQuery,
                    qnaId: qnaResult[0].id.toString()
                });

                var feedbackRecords: FeedbackRecords;
                feedbackRecords.feedbackRecords = records;

                var qnaClient = await this.getQnAClient();
                await qnaClient.callTrainAsync(feedbackRecords);

                return await step.next(qnaResult[0]);
            } 
            else if(reply == dialogOptions.qnaDialogResponseOptions.cardNoMatchText)
            {
                const activity = dialogOptions.qnaDialogResponseOptions.cardNoMatchResponse;
                if(activity)
                {
                    await step.context.sendActivity(activity);
                }
                else
                {
                    await step.context.sendActivity(this.DefaultCardNoMatchResponse);
                }

                return step.endDialog();
            }
            else
            {
                return await super.runStep(step, 0, DialogReason.beginCalled);
            }
        }

        return await step.next(step.result);
    }

    private async checkForMultiTurnPrompt(step: WaterfallStepContext): Promise<DialogTurnResult> {
        const dialogOptions:QnAMakerDialogOptions = step.activeDialog.state[this.Options];

        const response: QnAMakerResult[] = step.result;
        if(response && response.length > 0)
        {
            const answer = response[0];

            if(answer.context && answer.context.prompts.length > 0)
            {
                var previousContextData: { [key: string]: number } = {};

                answer.context.prompts.forEach(prompt => {
                    previousContextData[prompt.displayText] = prompt.qnaId;
                });

                step.activeDialog.state[this.QnAContextData] = previousContextData;
                step.activeDialog.state[this.PreviousQnAId] = answer.id;
                step.activeDialog.state[this.Options] = dialogOptions;

                //const message = 
                await step.context.sendActivity('This is a placeholder until the cardholder is built');

                return { status: DialogTurnStatus.waiting, result: undefined };
            }
        }

        return step.next(step.result);
    }

    private async displayQnAResult(step: WaterfallStepContext): Promise<DialogTurnResult> {
        const dialogOptions:QnAMakerDialogOptions = step.activeDialog.state[this.Options];
        const reply = step.context.activity.text;

        if (reply == dialogOptions.qnaDialogResponseOptions.cardNoMatchText)
        {
            const activity = dialogOptions.qnaDialogResponseOptions.cardNoMatchResponse;
            if(activity)
            {
                await step.context.sendActivity(activity);
            }
            else
            {
                await step.context.sendActivity(this.DefaultCardNoMatchResponse);
            }

            return step.endDialog();
        }

        const previousQnaId = step.activeDialog.state[this.PreviousQnAId];
        if(previousQnaId > 0)
        {
            return await super.runStep(step, 0, DialogReason.beginCalled);
        }

        const response: QnAMakerResult[] = step.result;
        if(response && response.length > 0)
        {
            await step.context.sendActivity(response[0].answer);
        }
        else
        {
            const activity = dialogOptions.qnaDialogResponseOptions.noAnswer;
            if(activity)
            {
                await step.context.sendActivity(activity);
            }
            else
            {
                await step.context.sendActivity(this.DefaultNoAnswer);
            }
        }

        return await step.endDialog(step.result);
    }

    private getQnAClient(): QnAMaker {
        const endpoint = {
            knowledgeBaseId: this.knowledgeBaseId,
            endpointKey: this.endpointKey,
            host: `https://${this.hostName}.azurewebsites.net/qnamaker`
        };
        return new QnAMaker(endpoint);
    }
}