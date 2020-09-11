/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes } from 'botbuilder-core';
import { WaterfallDialog, Dialog, DialogTurnResult, DialogContext, WaterfallStepContext, DialogReason } from 'botbuilder-dialogs';
import { QnAMakerOptions } from './qnamaker-interfaces/qnamakerOptions';
import { RankerTypes } from './qnamaker-interfaces/rankerTypes';
import { JoinOperator } from './qnamaker-interfaces/JoinOperator';
import { QnAMaker, QnAMakerResult } from './';
import { FeedbackRecord, FeedbackRecords, QnAMakerMetadata } from './qnamaker-interfaces';
import { QnACardBuilder } from './qnaCardBuilder';
import { ActiveLearningUtils } from './qnamaker-utils/activeLearningUtils';

const V4_API_REGEX = /^https:\/\/.*\.azurewebsites\.net\/qnamaker\/?/i;

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
 * A dialog that supports multi-step and adaptive-learning QnA Maker services.
 *
 * @remarks
 * An instance of this class targets a specific QnA Maker knowledge base.
 * It supports knowledge bases that include follow-up prompt and active learning features.
 * The dialog will also present user with appropriate multi-turn prompt or active learning options.
 */
export class QnAMakerDialog extends WaterfallDialog {

    // state and step value key constants
    /**
     * The path for storing and retrieving QnA Maker context data.
     *
     * @remarks
     * This represents context about the current or previous call to QnA Maker.
     * It is stored within the current step's [WaterfallStepContext](xref:botbuilder-dialogs.WaterfallStepContext).
     * It supports QnA Maker's follow-up prompt and active learning features.
     */
    private qnAContextData: string = 'previousContextData';
    /**
     * The path for storing and retrieving the previous question ID.
     *
     * @remarks
     * This represents the QnA question ID from the previous turn.
     * It is stored within the current step's [WaterfallStepContext](xref:botbuilder-dialogs.WaterfallStepContext).
     * It supports QnA Maker's follow-up prompt and active learning features.
     */
    private previousQnAId: string = 'previousQnAId';
    /**
     * The path for storing and retrieving the options for this instance of the dialog.
     *
     * @remarks
     * This includes the options with which the dialog was started and options expected by the QnA Maker service.
     * It is stored within the current step's [WaterfallStepContext](xref:botbuilder-dialogs.WaterfallStepContext).
     * It supports QnA Maker and the dialog system.
     */
    private options: string = 'options';
    private qnAData: string = 'qnaData';
    private currentQuery: string = 'currentQuery';

    // Dialog options parameters
    private defaultCardNoMatchResponse: string = `Thanks for the feedback.`;
    private defaultNoAnswer: string = `No QnAMaker answers found.`;

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
    private strictFiltersJoinOperator: JoinOperator;

    /**
     * Initializes a new instance of the [QnAMakerDialog](xref:QnAMakerDialog) class.
     * @param knowledgeBaseId The ID of the QnA Maker knowledge base to query.
     * @param endpointKey The QnA Maker endpoint key to use to query the knowledge base.
     * @param hostName The QnA Maker host URL for the knowledge base, starting with "https://" and ending with "/qnamaker".
     * @param noAnswer (Optional) The activity to send the user when QnA Maker does not find an answer.
     * @param threshold (Optional) The threshold above which to treat answers found from the knowledgebase as a match.
     * @param activeLearningCardTitle (Optional) The card title to use when showing active learning options to the user, if active learning is enabled.
     * @param cardNoMatchText (Optional) The button text to use with active learning options, allowing a user to indicate none of the options are applicable.
     * @param top (Optional) Maximum number of answers to return from the knowledge base.
     * @param cardNoMatchResponse (Optional) The activity to send the user if they select the no match option on an active learning card.
     * @param strictFilters (Optional) QnA Maker metadata with which to filter or boost queries to the knowledge base; or null to apply none.
     * @param dialogId (Optional) Id of the created dialog. Default is 'QnAMakerDialog'.
     */
    public constructor(knowledgeBaseId: string, endpointKey: string, hostName: string, noAnswer?: Activity, threshold: number = 0.3, activeLearningCardTitle: string = 'Did you mean:', cardNoMatchText: string = 'None of the above.', top: number = 3, cardNoMatchResponse?: Activity, strictFilters?: QnAMakerMetadata[], dialogId: string = 'QnAMakerDialog', strictFiltersJoinOperator: JoinOperator = JoinOperator.AND ) {
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
        this.strictFiltersJoinOperator = strictFiltersJoinOperator;
        this.addStep(this.callGenerateAnswer.bind(this));
        this.addStep(this.callTrain.bind(this));
        this.addStep(this.checkForMultiTurnPrompt.bind(this));
        this.addStep(this.displayQnAResult.bind(this));
    }

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     *
     * @remarks
     * If the task is successful, the result indicates whether the dialog is still
     * active after the turn has been processed by the dialog.
     *
     * You can use the [options](#options) parameter to include the QnA Maker context data,
     * which represents context from the previous query. To do so, the value should include a
     * `context` property of type [QnAResponseContext](#QnAResponseContext).
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options (Optional) Initial information to pass to the dialog.
     */
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
     * Gets the options for the QnA Maker client that the dialog will use to query the knowledge base.
     * @remarks If the task is successful, the result contains the QnA Maker options to use.
     * @returns A new instance of QnAMakerOptions.
     */
    private getQnAMakerOptions(): QnAMakerOptions {
        return {
            scoreThreshold: this.threshold,
            strictFilters: this.strintFilters,
            top: this.top,
            qnaId: 0,
            rankerType: RankerTypes.default,
            isTest: false,
            strictFiltersCompoundOperationType: this.strictFiltersCompoundOperationType
        };
    };

    /**
     * Gets the options the dialog will use to display query results to the user.
     * @remarks If the task is successful, the result contains the response options to use.
     * @returns A new instance of QnAMakerDialogResponseOptions.
     */
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

        if (qnaResponse.answers.length > 0 && qnaResponse.answers[0].score <= ActiveLearningUtils.MaximumScoreForLowScoreVariation / 100) {
            qnaResponse.answers = qna.getLowScoreVariation(qnaResponse.answers);

            if (isActiveLearningEnabled && qnaResponse.answers && qnaResponse.answers.length > 1) {
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
            host: this.getHost()
        };
        return new QnAMaker(endpoint);
    }

    /**
     * Gets unmodified v5 API hostName or constructs v4 API hostName
     * @remarks
     * Example of a complete v5 API endpoint: "https://qnamaker-acom.azure.com/qnamaker/v5.0"
     * Template literal to construct v4 API endpoint: `https://${ this.hostName }.azurewebsites.net/qnamaker`
     */
    private getHost(): string {
        let host: string = this.hostName;
        // If hostName includes 'qnamaker/v5', return the v5 API hostName.
        if (host.includes('qnamaker/v5')) {
            return host;
        }

        // V4 API logic
        // If the hostname contains all the necessary information, return it
        if (/^https:\/\/.*\.azurewebsites\.net\/qnamaker\/?/i.test(host)) {
            return host;
        }

        // Otherwise add required components
        if (!(/https?:\/\//i.test(host))) {
            host = 'https://' + host;
        }

        // Web App Bots provisioned through the QnAMaker portal have "xxx.azurewebsites.net" in their
        // environment variables
        if (host.endsWith('.azurewebsites.net')) {
            // Add the remaining required path
            return host + '/qnamaker';
        }

        // If this.hostName is just the azurewebsite subdomain, finish the remaining V4 API behavior shipped in 4.8.0
        // e.g. `https://${ this.hostName }.azurewebsites.net/qnamaker`
        if (!host.endsWith('.azurewebsites.net/qnamaker')) {
            host = host + '.azurewebsites.net/qnamaker';
        }

        return host;
    }
}
