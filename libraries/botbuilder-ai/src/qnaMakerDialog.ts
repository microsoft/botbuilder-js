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
import { FeedbackRecord, FeedbackRecords, QnAMakerMetadata } from './qnamaker-interfaces';
import { QnACardBuilder } from './qnaCardBuilder';

/**
 * QnAMakerDialog response options.
 */
export interface QnAMakerDialogResponseOptions {
    /**
    * Title for active learning card.
    */
    activeLearningCardTitle: string;
    /**
    * Text shown for 'no match' option on active learning card.
    */
    cardNoMatchText: string;
    /**
    * Activity to be sent in the event of no answer found in KB.
    */
    noAnswer: Activity;
    /**
    * Activity to be sent in the end that the 'no match' option is selected on active learning card.
    */
    cardNoMatchResponse: Activity;
}

/**
 * Options for QnAMakerDialog.
 */
export interface QnAMakerDialogOptions {
    /**
    * Options for QnAMaker knowledgebase.
    */
    qnaMakerOptions: QnAMakerOptions;
    /**
    * QnAMakerDialog response options.
    */
    qnaDialogResponseOptions: QnAMakerDialogResponseOptions;
}

/**
 * Query QnAMaker knowledgebase using user utterance. The dialog will also present user with appropriate multi-turn prompt or active learning options.
 */
export class QnAMakerDialog extends WaterfallDialog {
    
    // state and step value key constants
    private qnAContextData: string = 'previousContextData';
    private previousQnAId: string = 'previousQnAId';
    private options: string = 'options';
    private qnAData: string = 'qnaData';
    private currentQuery: string = 'currentQuery';

    // Dialog options parameters
    private defaultCardNoMatchResponse: string = `Thanks for the feedback.`;
    private defaultNoAnswer: string = `No QnAMaker answers found.`;
    private maximumScoreForLowScoreVariation: number = 0.95;

    private knowledgeBaseId: any;
    private hostName: any;
    private endpointKey: any;
    private threshold: number;
    private top: number;
    private noAnswer: Activity;
    private activeLearningCardTitle: string;
    private cardNoMatchText: string;
    private strintFilters: any;
    private cardNoMatchResponse: Activity;

    /**
     * Creates a new QnAMakerDialog instance.
     * @param knowledgeBaseId The Id of the QnAMaker knowledgebase to be queried.
     * @param endpointKey The endpoint key to use when querying the knowledgebase.
     * @param hostName Hostname to be used to form the QnAMaker host URL, which follows the following format https://{hostName}.azurewebsites.net/qnamaker
     * @param noAnswer (Optional) Activity to be sent in the event no answer is found within the knowledgebase.
     * @param threshold (Optional) The threshold above which to treat answers found from the knowledgebase as a match.
     * @param activeLearningCardTitle (Optional) Title of the card displayed showing active learning options if active learning is enabled.
     * @param cardNoMatchText (Optional) Text to be show on a button alongside active learning options, allowing a user to indicate none of the options are applicable.
     * @param top (Optional) Maximum number of answers to return from the knowledgebase.
     * @param cardNoMatchResponse (Optional) Activity to be sent if the user selects the no match option on an active learning card.
     * @param strictFilters (Optional) QnAMakerMetadata collection used to filter / boost queries to the knowledgebase.
     * @param dialogId (Optional) Id of the created dialog. Default is 'QnAMakerDialog'.
     */
    public constructor(knowledgeBaseId: string, endpointKey: string, hostName: string, noAnswer?: Activity, threshold: number = 0.3, activeLearningCardTitle: string = 'Did you mean:', cardNoMatchText: string = 'None of the above.', top: number = 3, cardNoMatchResponse?: Activity, strictFilters?: QnAMakerMetadata[], dialogId: string = 'QnAMakerDialog') {
        super(dialogId);
        if (!knowledgeBaseId) {
            throw new TypeError('QnAMakerDialog: missing knowledgeBaseId parameter');
        }

        if (!endpointKey) {
            throw new TypeError('QnAMakerDialog: missing endpointKey parameter');
        }

        if (!hostName) {
            throw new TypeError('QnAMakerDialog: missing hostName parameter');
        }

        this.knowledgeBaseId = knowledgeBaseId;
        this.endpointKey = endpointKey;
        this.hostName = hostName;
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
            return dc.endDialog(); 
        }

        const dialogOptions: QnAMakerDialogOptions = {
            qnaDialogResponseOptions: await this.getQnAResponseOptions(),
            qnaMakerOptions: await this.getQnAMakerOptions()
        };

        if(options)
        {
            Object.assign(dialogOptions, options);
        }

        return await super.beginDialog(dc, dialogOptions);
    }

    /**
     * Returns a new instance of QnAMakerOptions.
    **/
    private getQnAMakerOptions(): QnAMakerOptions {
        return {
            scoreThreshold: this.threshold,
            strictFilters: this.strintFilters,
            top: this.top,
            qnaId: 0,
            rankerType: RankerTypes.default,
            isTest: false
        };
    };
    
    /**
     * Returns a new instance of QnAMakerResponseOptions.
    **/
    private getQnAResponseOptions(): QnAMakerDialogResponseOptions {
        return {
            activeLearningCardTitle: this.activeLearningCardTitle,
            cardNoMatchResponse: this.cardNoMatchResponse,
            cardNoMatchText: this.cardNoMatchText,
            noAnswer: this.noAnswer
        };
    }

    /**
     * Queries the knowledgebase and either passes result to the next step or constructs and displays an active learning card
     * if active learning is enabled and multiple score close answers are returned.
    **/
    private async callGenerateAnswer(step: WaterfallStepContext): Promise<DialogTurnResult> {
        const dialogOptions: QnAMakerDialogOptions = step.activeDialog.state[this.options];
        dialogOptions.qnaMakerOptions.qnaId = 0;
        dialogOptions.qnaMakerOptions.context = { previousQnAId: 0, previousUserQuery: '' };

        step.values[this.currentQuery] = step.context.activity.text;
        const previousContextData: { [key: string]: number } = step.activeDialog.state[this.qnAContextData] || {};
        var previousQnAId = step.activeDialog.state[this.previousQnAId] || 0;
        
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
        step.activeDialog.state[this.previousQnAId] = previousQnAId;
        const isActiveLearningEnabled = qnaResponse.activeLearningEnabled;
        
        step.values[this.qnAData] = response.answers;
        
        if (isActiveLearningEnabled && qnaResponse.answers.length > 0 && qnaResponse.answers[0].score <= this.maximumScoreForLowScoreVariation) {
            qnaResponse.answers = qna.getLowScoreVariation(qnaResponse.answers);
            
            if (qnaResponse.answers && qnaResponse.answers.length > 1) {
                var suggestedQuestions: string[] = [];
                
                qnaResponse.answers.forEach(answer => {
                    suggestedQuestions.push(answer.questions[0]);
                });

                var message = QnACardBuilder.getSuggestionsCard(suggestedQuestions, dialogOptions.qnaDialogResponseOptions.activeLearningCardTitle, dialogOptions.qnaDialogResponseOptions.cardNoMatchText); 
                await step.context.sendActivity(message);

                step.activeDialog.state[this.options] = dialogOptions;
            
                return Dialog.EndOfTurn;
            }
        }

        const result: QnAMakerResult[] = [];
        
        if (response.answers && response.answers.length > 0) {
            result.push(response.answers[0]);
        }
        
        step.values[this.qnAData] = result;
        step.activeDialog.state[this.options] = dialogOptions;
        return await step.next(result);
    }

    /**
     * If active learning options were displayed in the previous step and the user has selected an option other
     * than 'no match' then the training API is called, passing the user's chosen question back to the knowledgebase.
     * If no active learning options were displayed in the previous step, the incoming result is immediately passed to the next step.
    **/
    private async callTrain(step: WaterfallStepContext): Promise<DialogTurnResult> {
        const dialogOptions: QnAMakerDialogOptions = step.activeDialog.state[this.options];
        const trainResponses: QnAMakerResult[] = step.values[this.qnAData];
        const currentQuery: string = step.values[this.currentQuery];

        const reply = step.context.activity.text;

        if(trainResponses && trainResponses.length > 1)
        {
            const qnaResult = trainResponses.filter(r => r.questions[0] == reply);

            if(qnaResult && qnaResult.length > 0)
            {
                var results: QnAMakerResult[] = [];
                results.push(qnaResult[0]);
                step.values[this.qnAData] = results;

                var records: FeedbackRecord[] = [];
                records.push({
                    userId: step.context.activity.id,
                    userQuestion: currentQuery,
                    qnaId: qnaResult[0].id.toString()
                });

                var feedbackRecords: FeedbackRecords = { feedbackRecords: records };

                await this.getQnAClient().callTrainAsync(feedbackRecords);

                return await step.next(qnaResult);
            } 
            else if(reply == dialogOptions.qnaDialogResponseOptions.cardNoMatchText)
            {
                const activity = dialogOptions.qnaDialogResponseOptions.cardNoMatchResponse;
                await step.context.sendActivity(activity || this.defaultCardNoMatchResponse);
                return step.endDialog();
            }
            else
            {
                return await super.runStep(step, 0, DialogReason.beginCalled);
            }
        }

        return await step.next(step.result);
    }

    /**
     * If multi turn prompts are included with the answer returned from the knowledgebase, this step constructs
     * and sends an activity with a hero card displaying the answer and the multi turn prompt options.
     * If no multi turn prompts exist then the result incoming result is passed to the next step.
    **/
    private async checkForMultiTurnPrompt(step: WaterfallStepContext): Promise<DialogTurnResult> {
        const dialogOptions: QnAMakerDialogOptions = step.activeDialog.state[this.options];
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

                step.activeDialog.state[this.qnAContextData] = previousContextData;
                step.activeDialog.state[this.previousQnAId] = answer.id;
                step.activeDialog.state[this.options] = dialogOptions;

                var message = QnACardBuilder.getQnAPromptsCard(answer); 
                await step.context.sendActivity(message);

                return Dialog.EndOfTurn;
            }
        }

        return step.next(step.result);
    }

    /**
     * Displays an appropriate response based on the incoming result to the user.If an answer has been identified it 
     * is sent to the user. Alternatively, if no answer has been identified or the user has indicated 'no match' on an
     * active learning card, then an appropriate message is sent to the user.
    **/
    private async displayQnAResult(step: WaterfallStepContext): Promise<DialogTurnResult> {
        const dialogOptions: QnAMakerDialogOptions = step.activeDialog.state[this.options];
        const reply = step.context.activity.text;

        if (reply == dialogOptions.qnaDialogResponseOptions.cardNoMatchText)
        {
            const activity = dialogOptions.qnaDialogResponseOptions.cardNoMatchResponse;
            await step.context.sendActivity(activity || this.defaultCardNoMatchResponse);
            return step.endDialog();
        }

        const previousQnaId = step.activeDialog.state[this.previousQnAId];
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
            await step.context.sendActivity(activity || this.defaultNoAnswer);
        }

        return await step.endDialog(step.result);
    }

    /**
     * Creates and returns an instance of the QnAMaker class used to query the knowledgebase.
    **/
    private getQnAClient(): QnAMaker {
        const endpoint = {
            knowledgeBaseId: this.knowledgeBaseId,
            endpointKey: this.endpointKey,
            host: this.constructHttpsHostName(this.hostName)
        };
        return new QnAMaker(endpoint);
    }

    /**
     * Retain backward compatibility for QnAMakerDialog.hostName.
     * @remarks
     * QnAMakerDialog shipped with the following:
     * this.hostName = `https://${this.hostName}.azurewebsites.net/qnamaker`
     * For parity reasons, this was removed
     * @param hostName Either complete or incomplete
     */
    private constructHttpsHostName(hostName: string): string {
        const hostNamePattern = /^(http[s]?\:).*(\.\w{1,})(\/qnamaker)/;

        return hostName.match(hostNamePattern) ? hostName : `https://${ this.hostName }.azurewebsites.net/qnamaker`;
    }
}
