/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes } from 'botbuilder-core';
import { WaterfallDialog, Dialog, DialogTurnResult, DialogContext, WaterfallStepContext, DialogTurnStatus } from 'botbuilder-dialogs';
import { QnAMakerOptions } from './qnamaker-interfaces/qnamakerOptions';
import { RankerTypes } from './qnamaker-interfaces/rankerTypes';
import { QnAMaker } from './';

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
    
    private QnAContextData: string;
    private PreviousQnAId: string;
    private Options: string;
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
        this.QnAContextData = 'qnaContextData';
        this.PreviousQnAId = 'prevQnAId';
        this.Options = 'options';
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

        super.addStep(this.callGenerateAnswer.bind(this));
        super.addStep(this.callTrain.bind(this));
        super.addStep(this.checkForMultiTurnPrompt.bind(this));
        super.addStep(this.displayQnAResult.bind(this));
    }

    public async beginDialog(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        if (!dc) { throw new Error('Missing DialogContext'); }
        
        if (dc.context.activity.type != ActivityTypes.Message) 
        { 
            return Dialog.EndOfTurn; 
        }

        var dialogOptions;
        dialogOptions.qnaDialogResponseOptions = await this.getQnAResponseOptions(dc);
        dialogOptions.qnaMakerOptions = await this.getQnAMakerOptions(dc);

        if(options)
        {
            Object.assign(dialogOptions, options);
        }

        dc.activeDialog.state.options = dialogOptions || {};

        await super.beginDialog(dc);
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
        const dialogOptions = step.activeDialog.state.options;
        dialogOptions.qnaMakerOptions.qnaId = 0;
        dialogOptions.qnaMakerOptions.context = { previousQnAId: 0, previousUserQuery: '' };

        step.values['currentQuery'] = step.context.activity.text;
        var previousContextData: { [key: string]: number } = {};
        var previousQnAId = 0;
        
        if (step.activeDialog.state.previousQnAId) {
            previousQnAId = step.activeDialog.state.previousQnAId;
        }
        
        if (step.activeDialog.state.previousContextData) {
            previousContextData = step.activeDialog.state.previousContextData;
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
        step.activeDialog.state.previousQnAId = previousQnAId;
        const isActiveLearningEnabled = qnaResponse.activeLearningEnabled;
        
        step.values['qnaData'] = response.answers;
        
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
            step.activeDialog.state.options = dialogOptions;
            
            return { status: DialogTurnStatus.waiting, result: undefined };
        }

        const result = [];
        
        if (response.answers && response.answers.length > 0) {
            result.push(response.answers[0]);
        }
        
        step.values['qnaData'] = result;
        step.activeDialog.state.options = dialogOptions;
        return await step.next(result);
    }

    private async callTrain(step: WaterfallStepContext): Promise<DialogTurnResult> {
        return await Dialog.EndOfTurn;
    }

    private async checkForMultiTurnPrompt(step: WaterfallStepContext): Promise<DialogTurnResult> {
        return await Dialog.EndOfTurn;
    }

    private async displayQnAResult(step: WaterfallStepContext): Promise<DialogTurnResult> {
        return await Dialog.EndOfTurn;
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