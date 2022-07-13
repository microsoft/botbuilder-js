/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as z from 'zod';
import { ActiveLearningUtils, BindToActivity } from './qnamaker-utils';
import { Activity, ActivityTypes, MessageFactory } from 'botbuilder-core';
import { QnACardBuilder } from './qnaCardBuilder';
import { QnAMaker, QnAMakerResult } from './';
import { QnAMakerClient, QnAMakerClientKey } from './qnaMaker';

import {
    ArrayExpression,
    ArrayExpressionConverter,
    BoolExpression,
    BoolExpressionConverter,
    EnumExpression,
    EnumExpressionConverter,
    Expression,
    IntExpression,
    IntExpressionConverter,
    NumberExpression,
    NumberExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    WaterfallDialog,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogEvent,
    DialogReason,
    DialogStateManager,
    DialogTurnResult,
    TemplateInterface,
    TurnPath,
    WaterfallStepContext,
} from 'botbuilder-dialogs';

import {
    FeedbackRecord,
    FeedbackRecords,
    JoinOperator,
    QnAMakerMetadata,
    QnAMakerOptions,
    RankerTypes,
} from './qnamaker-interfaces';

import { Filters } from './qnamaker-interfaces/filters';
import { CustomQuestionAnswering } from './customQuestionAnswering';
import { ServiceType } from './qnamaker-interfaces/serviceType';

class QnAMakerDialogActivityConverter
    implements Converter<string, TemplateInterface<Partial<Activity>, DialogStateManager>> {
    convert(
        value: string | TemplateInterface<Partial<Activity>, DialogStateManager>
    ): TemplateInterface<Partial<Activity>, DialogStateManager> {
        if (typeof value === 'string') {
            return new BindToActivity(MessageFactory.text(value) as Activity);
        }
        return value;
    }
}

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
    noAnswer: Partial<Activity>;
    /**
     * Activity to be sent in the end that the 'no match' option is selected on active learning card.
     */
    cardNoMatchResponse: Partial<Activity>;

    /**
     * Indicates whether the dialog response should display only precise answers.
     */
    displayPreciseAnswerOnly: boolean;
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

export interface QnAMakerDialogConfiguration extends DialogConfiguration {
    knowledgeBaseId?: string | Expression | StringExpression;
    hostname?: string | Expression | StringExpression;
    endpointKey?: string | Expression | StringExpression;
    threshold?: number | string | Expression | NumberExpression;
    top?: number | string | Expression | IntExpression;
    noAnswer?: string | Partial<Activity> | TemplateInterface<Partial<Activity>, DialogStateManager>;
    activeLearningCardTitle?: string | Expression | StringExpression;
    cardNoMatchText?: string | Expression | StringExpression;
    cardNoMatchResponse?: string | Partial<Activity> | TemplateInterface<Partial<Activity>, DialogStateManager>;
    strictFilters?: QnAMakerMetadata[] | string | Expression | ArrayExpression<QnAMakerMetadata>;
    logPersonalInformation?: boolean | string | Expression | BoolExpression;
    isTest?: boolean;
    rankerType?: RankerTypes | string | Expression | EnumExpression<RankerTypes>;
    displayPreciseAnswerOnly?: boolean;
    strictFiltersJoinOperator?: JoinOperator;
    includeUnstructuredSources?: boolean;
}

/**
 * Returns an activity with active learning suggestions.
 *
 * Important: The activity returned should relay the noMatchesText as an option to the end user.
 *
 * @param suggestionsList List of suggestions.
 * @param noMatchesText If this text is received by the bot during a prompt.
 */
export type QnASuggestionsActivityFactory = (suggestionsList: string[], noMatchesText: string) => Partial<Activity>;

const qnaSuggestionsActivityFactory = z.custom<QnASuggestionsActivityFactory>((val) => typeof val === 'function', {
    message: 'QnASuggestionsActivityFactory',
});

/**
 * A dialog that supports multi-step and adaptive-learning QnA Maker services.
 *
 * @summary
 * An instance of this class targets a specific QnA Maker knowledge base.
 * It supports knowledge bases that include follow-up prompt and active learning features.
 * The dialog will also present user with appropriate multi-turn prompt or active learning options.
 */
export class QnAMakerDialog extends WaterfallDialog implements QnAMakerDialogConfiguration {
    static $kind = 'Microsoft.QnAMakerDialog';

    // state and step value key constants

    /**
     * The path for storing and retrieving QnA Maker context data.
     *
     * @summary
     * This represents context about the current or previous call to QnA Maker.
     * It is stored within the current step's [WaterfallStepContext](xref:botbuilder-dialogs.WaterfallStepContext).
     * It supports QnA Maker's follow-up prompt and active learning features.
     */
    protected qnAContextData = 'previousContextData';

    /**
     * The path for storing and retrieving the previous question ID.
     *
     * @summary
     * This represents the QnA question ID from the previous turn.
     * It is stored within the current step's [WaterfallStepContext](xref:botbuilder-dialogs.WaterfallStepContext).
     * It supports QnA Maker's follow-up prompt and active learning features.
     */
    protected previousQnAId = 'previousQnAId';

    /**
     * The path for storing and retrieving the options for this instance of the dialog.
     *
     * @summary
     * This includes the options with which the dialog was started and options expected by the QnA Maker service.
     * It is stored within the current step's [WaterfallStepContext](xref:botbuilder-dialogs.WaterfallStepContext).
     * It supports QnA Maker and the dialog system.
     */
    protected options = 'options';

    // Dialog options parameters

    /**
     * The default threshold for answers returned, based on score.
     */
    protected defaultThreshold = 0.3;

    /**
     * The default maximum number of answers to be returned for the question.
     */
    protected defaultTopN = 3;

    private currentQuery = 'currentQuery';
    private qnAData = 'qnaData';
    private turnQnaresult = 'turnQnaresult';
    private defaultNoAnswer = '';

    // Card parameters
    private defaultCardTitle = 'Did you mean:';
    private defaultCardNoMatchText = 'None of the above.';
    private defaultCardNoMatchResponse = 'Thanks for the feedback.';

    /**
     * Gets or sets the QnA Maker knowledge base ID to query.
     */
    knowledgeBaseId: StringExpression;

    /**
     * Gets or sets the QnA Maker host URL for the knowledge base.
     */
    hostname: StringExpression;

    /**
     * Gets or sets the QnA Maker endpoint key to use to query the knowledge base.
     */
    endpointKey: StringExpression;

    /**
     * Gets or sets the threshold for answers returned, based on score.
     */
    threshold: NumberExpression = new NumberExpression(this.defaultThreshold);

    /**
     * Gets or sets the maximum number of answers to return from the knowledge base.
     */
    top: IntExpression = new IntExpression(this.defaultTopN);

    /**
     * Gets or sets the template to send to the user when QnA Maker does not find an answer.
     */
    noAnswer: TemplateInterface<Partial<Activity>, DialogStateManager> = new BindToActivity(
        MessageFactory.text(this.defaultNoAnswer)
    );

    /**
     * Gets or sets the card title to use when showing active learning options to the user.
     *
     * _Note: If suggestionsActivityFactory is passed in, this member is unused._
     */
    activeLearningCardTitle: StringExpression;

    /**
     * Gets or sets the button text to use with active learning options, allowing a user to
     * indicate non of the options are applicable.
     *
     * _Note: If suggestionsActivityFactory is passed in, this member is required._
     */
    cardNoMatchText: StringExpression;

    /**
     * Gets or sets the template to send to the user if they select the no match option on an
     * active learning card.
     */
    cardNoMatchResponse: TemplateInterface<Partial<Activity>, DialogStateManager> = new BindToActivity(
        MessageFactory.text(this.defaultCardNoMatchResponse)
    );

    /**
     * Gets or sets the QnA Maker metadata with which to filter or boost queries to the knowledge base,
     * or null to apply none.
     */
    strictFilters: QnAMakerMetadata[];

    /**
     * Gets or sets the flag to determine if personal information should be logged in telemetry.
     *
     * @summary
     * Defaults to a value of `=settings.telemetry.logPersonalInformation`, which retrieves
     * `logPersonalInformation` flag from settings.
     */
    logPersonalInformation = new BoolExpression('=settings.runtimeSettings.telemetry.logPersonalInformation');

    /**
     * Gets or sets a value indicating whether gets or sets environment of knowledgebase to be called.
     */
    isTest = false;

    /**
     * Gets or sets the QnA Maker ranker type to use.
     */
    rankerType: EnumExpression<RankerTypes> = new EnumExpression(RankerTypes.default);

    /**
     * Gets or sets a value indicating whether to include precise answer in response.
     */
    enablePreciseAnswer = true;

    /**
     * Gets or sets a value indicating whether the dialog response should display only precise answers.
     */
    displayPreciseAnswerOnly = false;

    /**
     * Question answering service type - qnaMaker or language
     */
    qnaServiceType = ServiceType.qnaMaker;

    /**
     * Gets or sets a value - AND or OR - logical operation on list of metadata
     */
    strictFiltersJoinOperator: JoinOperator;

    /**
     * Gets or sets the metadata and sources used to filter results.
     */
    filters: Filters;

    /**
     * Gets or sets a value indicating whether to include unstructured sources in search for answers.
     */
    includeUnstructuredSources = true;

    // TODO: Add Expressions support
    private suggestionsActivityFactory?: QnASuggestionsActivityFactory;

    private normalizedHost: string;

    /**
     * Initializes a new instance of the [QnAMakerDialog](xref:QnAMakerDialog) class.
     *
     * @param {string} knowledgeBaseId The ID of the QnA Maker knowledge base to query.
     * @param {string} endpointKey The QnA Maker endpoint key to use to query the knowledge base.
     * @param {string} hostname The QnA Maker host URL for the knowledge base, starting with "https://" and ending with "/qnamaker".
     * @param {string} noAnswer (Optional) The activity to send the user when QnA Maker does not find an answer.
     * @param {number} threshold (Optional) The threshold above which to treat answers found from the knowledgebase as a match.
     * @param {string} activeLearningCardTitle (Optional) The card title to use when showing active learning options to the user, if active learning is enabled.
     * @param {string} cardNoMatchText (Optional) The button text to use with active learning options, allowing a user to indicate none of the options are applicable.
     * @param {number} top (Optional) Maximum number of answers to return from the knowledge base.
     * @param {Activity} cardNoMatchResponse (Optional) The activity to send the user if they select the no match option on an active learning card.
     * @param {QnAMakerMetadata[]} strictFilters (Optional) QnA Maker metadata with which to filter or boost queries to the knowledge base; or null to apply none.
     * @param {string} dialogId (Optional) Id of the created dialog. Default is 'QnAMakerDialog'.
     * @param {string} strictFiltersJoinOperator join operator for strict filters
     */
    constructor(
        knowledgeBaseId?: string,
        endpointKey?: string,
        hostname?: string,
        noAnswer?: Activity,
        threshold?: number,
        activeLearningCardTitle?: string,
        cardNoMatchText?: string,
        top?: number,
        cardNoMatchResponse?: Activity,
        rankerType?: RankerTypes,
        strictFilters?: QnAMakerMetadata[],
        dialogId?: string,
        strictFiltersJoinOperator?: JoinOperator,
        enablePreciseAnswer?: boolean,
        displayPreciseAnswerOnly?: boolean,
        qnaServiceType?: ServiceType
    );

    /**
     * Initializes a new instance of the [QnAMakerDialog](xref:QnAMakerDialog) class.
     *
     * @param {string} knowledgeBaseId The ID of the QnA Maker knowledge base to query.
     * @param {string} endpointKey The QnA Maker endpoint key to use to query the knowledge base.
     * @param {string} hostname The QnA Maker host URL for the knowledge base, starting with "https://" and ending with "/qnamaker".
     * @param {string} noAnswer (Optional) The activity to send the user when QnA Maker does not find an answer.
     * @param {number} threshold (Optional) The threshold above which to treat answers found from the knowledgebase as a match.
     * @param {Function} suggestionsActivityFactory [QnASuggestionsActivityFactory](xref:botbuilder-ai.QnASuggestionsActivityFactory) used for custom Activity formatting.
     * @param {string} cardNoMatchText The text to use with the active learning options, allowing a user to indicate none of the options are applicable.
     * @param {number} top (Optional) Maximum number of answers to return from the knowledge base.
     * @param {Activity} cardNoMatchResponse (Optional) The activity to send the user if they select the no match option on an active learning card.
     * @param {QnAMakerMetadata[]} strictFilters (Optional) QnA Maker metadata with which to filter or boost queries to the knowledge base; or null to apply none.
     * @param {string} dialogId (Optional) Id of the created dialog. Default is 'QnAMakerDialog'.
     * @param {string} strictFiltersJoinOperator join operator for strict filters
     */
    constructor(
        knowledgeBaseId?: string,
        endpointKey?: string,
        hostname?: string,
        noAnswer?: Activity,
        threshold?: number,
        suggestionsActivityFactory?: QnASuggestionsActivityFactory,
        cardNoMatchText?: string,
        top?: number,
        cardNoMatchResponse?: Activity,
        rankerType?: RankerTypes,
        strictFilters?: QnAMakerMetadata[],
        dialogId?: string,
        strictFiltersJoinOperator?: JoinOperator,
        enablePreciseAnswer?: boolean,
        displayPreciseAnswerOnly?: boolean,
        qnaServiceType?: ServiceType
    );

    /**
     * @internal
     */
    constructor(
        knowledgeBaseId?: string,
        endpointKey?: string,
        hostname?: string,
        noAnswer?: Activity,
        threshold?: number,
        activeLearningTitleOrFactory?: string | QnASuggestionsActivityFactory,
        cardNoMatchText?: string,
        top?: number,
        cardNoMatchResponse?: Activity,
        rankerType?: RankerTypes,
        strictFilters?: QnAMakerMetadata[],
        dialogId = 'QnAMakerDialog',
        // TODO: Should member exist in QnAMakerDialogConfiguration?
        //       And be of type `string | JoinOperator | Expression | EnumExpression<JoinOperator>`?
        strictFiltersJoinOperator?: JoinOperator,
        enablePreciseAnswer?: boolean,
        displayPreciseAnswerOnly?: boolean,
        qnaServiceType?: ServiceType
    ) {
        super(dialogId);
        if (knowledgeBaseId) {
            this.knowledgeBaseId = new StringExpression(knowledgeBaseId);
        }

        if (endpointKey) {
            this.endpointKey = new StringExpression(endpointKey);
        }

        if (hostname) {
            this.hostname = new StringExpression(hostname);
        }

        if (threshold) {
            this.threshold = new NumberExpression(threshold);
        }

        if (top) {
            this.top = new IntExpression(top);
        }

        if (qnaSuggestionsActivityFactory.check(activeLearningTitleOrFactory)) {
            if (!cardNoMatchText) {
                // Without a developer-provided cardNoMatchText, the end user will not be able to tell the convey to the bot and QnA Maker that the suggested alternative questions were not correct.
                // When the user's reply to a suggested alternatives Activity matches the cardNoMatchText, the QnAMakerDialog sends this information to the QnA Maker service for active learning.
                throw new Error('cardNoMatchText is required when using the suggestionsActivityFactory.');
            }

            this.suggestionsActivityFactory = activeLearningTitleOrFactory;
        } else {
            this.activeLearningCardTitle = new StringExpression(activeLearningTitleOrFactory ?? this.defaultCardTitle);
        }

        if (cardNoMatchText) {
            this.cardNoMatchText = new StringExpression(cardNoMatchText);
        }

        if (strictFilters) {
            this.strictFilters = strictFilters;
        }

        if (strictFiltersJoinOperator) {
            this.strictFiltersJoinOperator = strictFiltersJoinOperator;
        }

        if (noAnswer) {
            this.noAnswer = new BindToActivity(noAnswer);
        }

        this.cardNoMatchResponse = new BindToActivity(
            cardNoMatchResponse ?? MessageFactory.text(this.defaultCardNoMatchResponse)
        );

        if (enablePreciseAnswer != undefined) {
            this.enablePreciseAnswer = enablePreciseAnswer;
        }

        if (displayPreciseAnswerOnly != undefined) {
            this.displayPreciseAnswerOnly = displayPreciseAnswerOnly;
        }
        if (rankerType != undefined) {
            this.rankerType = new EnumExpression(rankerType);
        }
        this.qnaServiceType = qnaServiceType;

        this.addStep(this.callGenerateAnswer.bind(this));
        this.addStep(this.callTrain.bind(this));
        this.addStep(this.checkForMultiTurnPrompt.bind(this));
        this.addStep(this.displayQnAResult.bind(this));
    }

    /**
     * @param property Properties that extend QnAMakerDialogConfiguration.
     * @returns The expression converter.
     */
    getConverter(property: keyof QnAMakerDialogConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'knowledgeBaseId':
                return new StringExpressionConverter();
            case 'hostname':
                return new StringExpressionConverter();
            case 'endpointKey':
                return new StringExpressionConverter();
            case 'threshold':
                return new NumberExpressionConverter();
            case 'top':
                return new IntExpressionConverter();
            case 'noAnswer':
                return new QnAMakerDialogActivityConverter();
            case 'activeLearningCardTitle':
                return new StringExpressionConverter();
            case 'cardNoMatchText':
                return new StringExpressionConverter();
            case 'cardNoMatchResponse':
                return new QnAMakerDialogActivityConverter();
            case 'strictFilters':
                return new ArrayExpressionConverter();
            case 'logPersonalInformation':
                return new BoolExpressionConverter();
            case 'rankerType':
                return new EnumExpressionConverter(RankerTypes);
            case 'displayPreciseAnswerOnly':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     *
     * @summary
     * If the task is successful, the result indicates whether the dialog is still
     * active after the turn has been processed by the dialog.
     *
     * You can use the [options](#options) parameter to include the QnA Maker context data,
     * which represents context from the previous query. To do so, the value should include a
     * `context` property of type [QnAResponseContext](#QnAResponseContext).
     *
     * @param {DialogContext} dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param {object} options (Optional) Initial information to pass to the dialog.
     * @returns {Promise<DialogTurnResult>} A promise resolving to the turn result
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    async beginDialog(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        if (!dc) {
            throw new Error('Missing DialogContext');
        }

        if (dc.context?.activity?.type !== ActivityTypes.Message) {
            return dc.endDialog();
        }

        const dialogOptions: QnAMakerDialogOptions = {
            qnaDialogResponseOptions: await this.getQnAResponseOptions(dc),
            qnaMakerOptions: await this.getQnAMakerOptions(dc),
        };

        if (options) {
            Object.assign(dialogOptions, options);
        }

        return super.beginDialog(dc, dialogOptions);
    }

    /**
     * Called when the dialog is _continued_, where it is the active dialog and the
     * user replies with a new [Activity](xref:botframework-schema.Activity).
     *
     * @param {DialogContext} dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns {DialogContext} A Promise representing the asynchronous operation.
     */
    continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        const interrupted = dc.state.getValue<boolean>(TurnPath.interrupted, false);
        if (interrupted) {
            // if qnamaker was interrupted then end the qnamaker dialog
            return dc.endDialog();
        }

        return super.continueDialog(dc);
    }

    /**
     * Called before an event is bubbled to its parent.
     *
     * @param {DialogContext} dc The dialog context for the current turn of conversation.
     * @param {DialogEvent} e The event being raised.
     * @returns {Promise<boolean>} Whether the event is handled by the current dialog and further processing should stop.
     */
    protected async onPreBubbleEvent(dc: DialogContext, e: DialogEvent): Promise<boolean> {
        // When the DialogEvent.name is 'error', it's possible to end in a loop where events
        // keep firing if the error is encountered while trying to call QnA Maker.
        // If an error is encountered, forward it to this dialog's parent.
        if (e.name === 'error') {
            return this.onPostBubbleEvent(dc, e);
        } else if (dc.context?.activity?.type === ActivityTypes.Message) {
            // decide whether we want to allow interruption or not.
            // if we don't get a response from QnA which signifies we expect it,
            // then we allow interruption.

            const reply = dc.context.activity.text;
            const dialogOptions: QnAMakerDialogOptions = dc.activeDialog.state[this.options];

            if (reply.toLowerCase() === dialogOptions.qnaDialogResponseOptions.cardNoMatchText.toLowerCase()) {
                // it matches nomatch text, we like that.
                return true;
            }

            const suggestedQuestions = dc.state.getValue<string[]>('this.suggestedQuestions');
            if (suggestedQuestions) {
                if (suggestedQuestions?.some((question) => question.toLowerCase() === reply.toLowerCase().trim())) {
                    // it matches one of the suggested actions, we like that.
                    return true;
                }

                // Calling QnAMaker to get response.
                const qnaClient = await this.getQnAMakerClient(dc);
                this.resetOptions(dc, dialogOptions);
                const response = await qnaClient.getAnswersRaw(dc.context, dialogOptions.qnaMakerOptions);
                // disable interruption if we have answers.
                return response.answers?.length > 0 ?? false;
            }
        }

        // call base for default behavior.
        return this.onPostBubbleEvent(dc, e);
    }

    /**
     * Gets an [QnAMakerClient](xref:botbuilder-ai.QnAMakerClient) to use to access the QnA Maker knowledge base.
     *
     * @param {DialogContext} dc The dialog context for the current turn of conversation.
     * @returns {Promise<QnAMakerClient>} A promise of QnA Maker instance.
     */
    protected async getQnAMakerClient(dc: DialogContext): Promise<QnAMakerClient> {
        const qnaClient = dc.context?.turnState?.get<QnAMakerClient>(QnAMakerClientKey);
        if (qnaClient) {
            return qnaClient;
        }

        const endpoint = {
            knowledgeBaseId: this.knowledgeBaseId.getValue(dc.state),
            endpointKey: this.endpointKey.getValue(dc.state),
            host: this.qnaServiceType === ServiceType.language ? this.hostname.getValue(dc.state) : this.getHost(dc),
            qnaServiceType: this.qnaServiceType,
        };

        const logPersonalInformation =
            this.logPersonalInformation instanceof BoolExpression
                ? this.logPersonalInformation.getValue(dc.state)
                : this.logPersonalInformation;
        if (endpoint.qnaServiceType === ServiceType.language) {
            return new CustomQuestionAnswering(
                endpoint,
                await this.getQnAMakerOptions(dc),
                this.telemetryClient,
                logPersonalInformation
            );
        } else {
            return new QnAMaker(
                endpoint,
                await this.getQnAMakerOptions(dc),
                this.telemetryClient,
                logPersonalInformation
            );
        }
    }

    /**
     * Gets the options for the QnA Maker client that the dialog will use to query the knowledge base.
     *
     * @param {DialogContext} dc The dialog context for the current turn of conversation.
     * @returns {Promise<QnAMakerOptions>} A promise of QnA Maker options to use.
     */
    protected async getQnAMakerOptions(dc: DialogContext): Promise<QnAMakerOptions> {
        return {
            scoreThreshold: this.threshold?.getValue(dc.state) ?? this.defaultThreshold,
            strictFilters: this.strictFilters,
            filters: this.filters,
            top: this.top?.getValue(dc.state) ?? this.defaultTopN,
            qnaId: 0,
            rankerType: this.rankerType?.getValue(dc.state) ?? RankerTypes.default,
            isTest: this.isTest,
            strictFiltersJoinOperator: this.strictFiltersJoinOperator,
            enablePreciseAnswer: this.enablePreciseAnswer,
            includeUnstructuredSources: this.includeUnstructuredSources,
        };
    }

    /**
     * Gets the options the dialog will use to display query results to the user.
     *
     * @param {DialogContext} dc The dialog context for the current turn of conversation.
     * @returns {Promise<QnAMakerDialogResponseOptions>} A promise of QnA Maker response options to use.
     */
    protected async getQnAResponseOptions(dc: DialogContext): Promise<QnAMakerDialogResponseOptions> {
        return {
            activeLearningCardTitle: this.activeLearningCardTitle?.getValue(dc?.state) ?? this.defaultCardTitle,
            cardNoMatchResponse: this.cardNoMatchResponse && (await this.cardNoMatchResponse.bind(dc, dc?.state)),
            cardNoMatchText: this.cardNoMatchText?.getValue(dc?.state) ?? this.defaultCardNoMatchText,
            noAnswer: await this.noAnswer?.bind(dc, dc?.state),
            displayPreciseAnswerOnly: this.displayPreciseAnswerOnly,
        };
    }

    /**
     * Displays an appropriate response based on the incoming result to the user. If an answer has been identified it
     * is sent to the user. Alternatively, if no answer has been identified or the user has indicated 'no match' on an
     * active learning card, then an appropriate message is sent to the user.
     *
     * @param {WaterfallStepContext} step the waterfall step context
     * @returns {Promise<DialogTurnResult>} a promise resolving to the dialog turn result
     **/
    protected async displayQnAResult(step: WaterfallStepContext): Promise<DialogTurnResult> {
        const dialogOptions: QnAMakerDialogOptions = step.activeDialog.state[this.options];
        const reply = step.context.activity.text;

        if (reply === dialogOptions.qnaDialogResponseOptions.cardNoMatchText) {
            const activity = dialogOptions.qnaDialogResponseOptions.cardNoMatchResponse;
            await step.context.sendActivity(activity ?? this.defaultCardNoMatchResponse);
            return step.endDialog();
        }

        const previousQnaId = step.activeDialog.state[this.previousQnAId];
        if (previousQnaId > 0) {
            return super.runStep(step, 0, DialogReason.beginCalled);
        }

        // display QnA Result will be the next step for all button clicks
        // step.result will be the question chosen by the bot user
        // unlike the usual flow where step.result contains getAnswersRaw response.answers.
        const response: QnAMakerResult[] =
            typeof step.result === 'string'
                ? step.values[this.turnQnaresult]?.filter((ans) => ans.questions[0] === step.result)
                : step.result;
        if (response?.length > 0) {
            const activity = dialogOptions.qnaDialogResponseOptions.noAnswer;
            if (response[0].id !== -1) {
                const message = QnACardBuilder.getQnAAnswerCard(response[0], this.displayPreciseAnswerOnly);
                await step.context.sendActivity(message);
            } else {
                if (activity && activity.text) {
                    await step.context.sendActivity(activity);
                } else {
                    const message = QnACardBuilder.getQnAAnswerCard(response[0], this.displayPreciseAnswerOnly);
                    await step.context.sendActivity(message);
                }
            }
        } else {
            await step.context.sendActivity('No QnAMaker answers found.');
        }

        return step.endDialog(step.result);
    }

    private resetOptions(dc: DialogContext, dialogOptions: QnAMakerDialogOptions) {
        // Resetting QnAId if not present in value
        const qnaIdFromContext = dc.context.activity.value;

        if (qnaIdFromContext != null) {
            dialogOptions.qnaMakerOptions.qnaId = qnaIdFromContext;
        } else {
            dialogOptions.qnaMakerOptions.qnaId = 0;
        }

        // Resetting context
        dialogOptions.qnaMakerOptions.context = { previousQnAId: 0, previousUserQuery: '' };

        // Check if previous context is present, if yes then put it with the query
        // Check for id if query is present in reverse index.
        const previousContextData: Record<string, number> = dc.activeDialog.state[this.qnAContextData] ?? {};
        const previousQnAId = dc.activeDialog.state[this.previousQnAId] ?? 0;

        if (previousQnAId > 0) {
            dialogOptions.qnaMakerOptions.context = {
                previousQnAId,
                previousUserQuery: '',
            };

            const currentQnAId = previousContextData[dc.context.activity.text];
            if (currentQnAId) {
                dialogOptions.qnaMakerOptions.qnaId = currentQnAId;
            }
        }
    }

    // Queries the knowledgebase and either passes result to the next step or constructs and displays an active learning card
    // if active learning is enabled and multiple score close answers are returned.
    private async callGenerateAnswer(step: WaterfallStepContext): Promise<DialogTurnResult> {
        // clear suggestedQuestions between turns.
        step.state.deleteValue('this.suggestedQuestions');

        const dialogOptions: QnAMakerDialogOptions = step.activeDialog.state[this.options];
        this.resetOptions(step, dialogOptions);

        step.values[this.currentQuery] = step.context.activity.text;
        const previousContextData: { [key: string]: number } = step.activeDialog.state[this.qnAContextData] || {};
        let previousQnAId = step.activeDialog.state[this.previousQnAId] || 0;

        if (previousQnAId > 0) {
            dialogOptions.qnaMakerOptions.context = { previousQnAId, previousUserQuery: '' };

            if (previousContextData[step.context.activity.text]) {
                dialogOptions.qnaMakerOptions.qnaId = previousContextData[step.context.activity.text];
            }
        }

        const qna = await this.getQnAMakerClient(step);
        const response = await qna.getAnswersRaw(step.context, dialogOptions.qnaMakerOptions);

        const qnaResponse = {
            activeLearningEnabled: response.activeLearningEnabled,
            answers: response.answers,
        };

        previousQnAId = -1;
        step.activeDialog.state[this.previousQnAId] = previousQnAId;
        const isActiveLearningEnabled = qnaResponse.activeLearningEnabled;

        step.values[this.qnAData] = response.answers;

        if (
            qnaResponse.answers.length > 0 &&
            qnaResponse.answers[0].score <= ActiveLearningUtils.MaximumScoreForLowScoreVariation / 100
        ) {
            qnaResponse.answers = qna.getLowScoreVariation(qnaResponse.answers);

            if (isActiveLearningEnabled && qnaResponse.answers?.length > 1) {
                // filter answers from structured documents only which has corresponsing questions that can be shown for disambiguation in suggestions card
                const suggestedQuestions = qnaResponse.answers
                    .filter((answer) => !!answer.questions && answer.questions.length > 0)
                    .map((ans) => ans.questions[0]);

                if (suggestedQuestions?.length > 0) {
                    const message =
                        this.suggestionsActivityFactory?.(
                            suggestedQuestions,
                            dialogOptions.qnaDialogResponseOptions.cardNoMatchText
                        ) ??
                        QnACardBuilder.getSuggestionsCard(
                            suggestedQuestions,
                            dialogOptions.qnaDialogResponseOptions.activeLearningCardTitle,
                            dialogOptions.qnaDialogResponseOptions.cardNoMatchText
                        );

                    z.record(z.unknown()).parse(message, { path: ['message'] });
                    await step.context.sendActivity(message);

                    step.activeDialog.state[this.options] = dialogOptions;
                    step.state.setValue('this.suggestedQuestions', suggestedQuestions);
                    step.values[this.turnQnaresult] = qnaResponse.answers;
                    return Dialog.EndOfTurn;
                } else {
                    step.values[this.turnQnaresult] = [];
                }
            }
        }

        const result: QnAMakerResult[] = [];

        if (response.answers?.length > 0) {
            result.push(response.answers[0]);
        }

        step.values[this.qnAData] = result;
        step.activeDialog.state[this.options] = dialogOptions;
        return step.next(result);
    }

    // If active learning options were displayed in the previous step and the user has selected an option other
    // than 'no match' then the training API is called, passing the user's chosen question back to the knowledgebase.
    // If no active learning options were displayed in the previous step, the incoming result is immediately passed to the next step.
    private async callTrain(step: WaterfallStepContext): Promise<DialogTurnResult> {
        const dialogOptions: QnAMakerDialogOptions = step.activeDialog.state[this.options];
        const trainResponses: QnAMakerResult[] = step.values[this.turnQnaresult];
        const currentQuery: string = step.values[this.currentQuery];

        const reply = step.context.activity.text;

        if (trainResponses?.length > 1) {
            const qnaResult = trainResponses.filter((r) => r.questions[0] === reply);

            if (qnaResult?.length > 0) {
                const results: QnAMakerResult[] = [];
                results.push(qnaResult[0]);
                step.values[this.qnAData] = results;

                const records: FeedbackRecord[] = [];
                records.push({
                    userId: step.context.activity.id,
                    userQuestion: currentQuery,
                    qnaId: qnaResult[0].id.toString(),
                });

                const feedbackRecords: FeedbackRecords = { feedbackRecords: records };

                const qnaClient = await this.getQnAMakerClient(step);
                await qnaClient.callTrain(feedbackRecords);

                return step.next(qnaResult);
            } else if (reply === dialogOptions.qnaDialogResponseOptions.cardNoMatchText) {
                const activity = dialogOptions.qnaDialogResponseOptions.cardNoMatchResponse;
                await step.context.sendActivity(activity || this.defaultCardNoMatchResponse);
                return step.endDialog();
            } else {
                // clear turnQnAResult when no button is clicked
                step.values[this.turnQnaresult] = [];
                return super.runStep(step, 0, DialogReason.beginCalled);
            }
        }

        return step.next(step.result);
    }

    // If multi turn prompts are included with the answer returned from the knowledgebase, this step constructs
    // and sends an activity with a hero card displaying the answer and the multi turn prompt options.
    // If no multi turn prompts exist then the result incoming result is passed to the next step.
    private async checkForMultiTurnPrompt(step: WaterfallStepContext): Promise<DialogTurnResult> {
        const dialogOptions: QnAMakerDialogOptions = step.activeDialog.state[this.options];
        const response: QnAMakerResult[] = step.result;

        if (response?.length > 0 && response[0].id != -1) {
            const answer = response[0];
            if (answer?.context?.prompts?.length > 0) {
                const previousContextData: { [key: string]: number } = {};

                answer.context.prompts.forEach((prompt) => {
                    previousContextData[prompt.displayText] = prompt.qnaId;
                });

                step.activeDialog.state[this.qnAContextData] = previousContextData;
                step.activeDialog.state[this.previousQnAId] = answer.id;
                step.activeDialog.state[this.options] = dialogOptions;
                const message = QnACardBuilder.getQnAAnswerCard(answer, this.displayPreciseAnswerOnly);
                await step.context.sendActivity(message);
                return Dialog.EndOfTurn;
            }
        }

        return step.next(step.result);
    }

    // Gets unmodified v5 API hostName or constructs v4 API hostName
    //
    // Example of a complete v5 API endpoint: "https://qnamaker-acom.azure.com/qnamaker/v5.0"
    //
    // Template literal to construct v4 API endpoint: `https://${ this.hostName }.azurewebsites.net/qnamaker`
    private getHost(dc: DialogContext): string {
        let host = this.hostname.getValue(dc.state);

        // Return the memoized host, but allow it to change at runtime.
        if (this.normalizedHost && this.normalizedHost.includes(host)) {
            return this.normalizedHost;
        }

        // Handle no protocol.
        if (!/^https?:\/\//.test(host)) {
            host = 'https://' + host;
        }

        // Handle no domain.
        if (!host.includes('.')) {
            host = host + '.azurewebsites.net';
        }

        // Handle no pathname, only for azurewebsites.net domains.
        if (!host.includes('/qnamaker') && host.includes('azurewebsites.net')) {
            host = host + '/qnamaker';
        }

        // Memoize the host.
        this.normalizedHost = host;

        return host;
    }
}
