## API Report File for "botbuilder-ai"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Activity } from 'botbuilder-core';
import { ArrayExpression } from 'adaptive-expressions';
import { Attachment } from 'botbuilder-core';
import { BoolExpression } from 'adaptive-expressions';
import { BotComponent } from 'botbuilder-core';
import { BotTelemetryClient } from 'botbuilder-core';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { ComponentRegistration } from 'botbuilder-core';
import { Configuration } from 'botbuilder-dialogs-adaptive-runtime-core';
import { Converter } from 'botbuilder-dialogs';
import { ConverterFactory } from 'botbuilder-dialogs';
import { DialogConfiguration } from 'botbuilder-dialogs';
import { DialogContext } from 'botbuilder-dialogs';
import { DialogEvent } from 'botbuilder-dialogs';
import { DialogStateManager } from 'botbuilder-dialogs';
import { DialogTurnResult } from 'botbuilder-dialogs';
import { EnumExpression } from 'adaptive-expressions';
import { Expression } from 'adaptive-expressions';
import { IntExpression } from 'adaptive-expressions';
import { NumberExpression } from 'adaptive-expressions';
import { ObjectExpression } from 'adaptive-expressions';
import { Recognizer } from 'botbuilder-dialogs';
import { RecognizerConfiguration } from 'botbuilder-dialogs';
import { RecognizerResult } from 'botbuilder-core';
import { RequestOptionsBase } from 'botbuilder-stdlib/lib/azureCoreHttpCompat';
import { ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';
import { StringExpression } from 'adaptive-expressions';
import { TemplateInterface } from 'botbuilder-dialogs';
import { TurnContext } from 'botbuilder-core';
import { WaterfallDialog } from 'botbuilder-dialogs';
import { WaterfallStepContext } from 'botbuilder-dialogs';

// @public
export class ActiveLearningUtils {
    static getLowScoreVariation(qnaSearchResults: QnAMakerResult[]): QnAMakerResult[];
    static readonly MaximumScoreForLowScoreVariation = 95;
    static readonly MaxLowScoreVariationMultiplier = 1;
    static readonly MinimumScoreForLowScoreVariation = 20;
    static readonly PreviousLowScoreVariationMultiplier = 0.7;
}

// @public
export enum Anchor {
    // (undocumented)
    Current = "current",
    // (undocumented)
    End = "end",
    // (undocumented)
    Start = "start"
}

// @public
export interface AnswerSpanResponse {
    endIndex?: number;
    score: number;
    startIndex?: number;
    text: string;
}

// Warning: (ae-forgotten-export) The symbol "QnAMakerClient_2" needs to be exported by the entry point index.d.ts
// Warning: (ae-forgotten-export) The symbol "QnAMakerTelemetryClient_2" needs to be exported by the entry point index.d.ts
//
// @public
export class CustomQuestionAnswering implements QnAMakerClient_2, QnAMakerTelemetryClient_2 {
    constructor(endpoint: QnAMakerEndpoint, options?: QnAMakerOptions, telemetryClient?: BotTelemetryClient, logPersonalInformation?: boolean);
    callTrain(feedbackRecords: FeedbackRecords): Promise<void>;
    protected fillQnAEvent(qnaResults: QnAMakerResult[], turnContext: TurnContext, telemetryProperties?: Record<string, string>, telemetryMetrics?: Record<string, number>): Promise<[Record<string, string>, Record<string, number>]>;
    getAnswers(context: TurnContext, options?: QnAMakerOptions, telemetryProperties?: {
        [key: string]: string;
    }, telemetryMetrics?: {
        [key: string]: number;
    }): Promise<QnAMakerResult[]>;
    getAnswersRaw(context: TurnContext, options: QnAMakerOptions, telemetryProperties: {
        [key: string]: string;
    }, telemetryMetrics: {
        [key: string]: number;
    }): Promise<QnAMakerResults>;
    getKnowledgebaseAnswersRaw(context: TurnContext, options: QnAMakerOptions, telemetryProperties: {
        [key: string]: string;
    }, telemetryMetrics: {
        [key: string]: number;
    }): Promise<QnAMakerResults>;
    getLowScoreVariation(queryResult: QnAMakerResult[]): QnAMakerResult[];
    get logPersonalInformation(): boolean;
    protected onQnaResults(qnaResults: QnAMakerResult[], turnContext: TurnContext, telemetryProperties?: {
        [key: string]: string;
    }, telemetryMetrics?: {
        [key: string]: number;
    }): Promise<void>;
    get telemetryClient(): BotTelemetryClient;
}

// @public
export interface DateTimeSpec {
    timex: string[];
    type: string;
}

// @public
export interface DynamicList {
    listEntityName?: string;
    requestLists?: ListElement[];
}

// @public
export interface ExternalEntity<T = unknown> {
    entityLength?: number;
    entityName?: string;
    resolution?: T;
    startIndex?: number;
}

// @public
export interface FeedbackRecord {
    qnaId: string;
    userId: string;
    userQuestion: string;
}

// @public
export interface FeedbackRecords {
    feedbackRecords: FeedbackRecord[];
}

// @public
export interface Filters {
    // (undocumented)
    logicalOperation: string;
    // (undocumented)
    metadataFilter: MetadataFilter;
    // (undocumented)
    sourceFilter: Array<string>;
}

// @public
export interface GeographyV2 {
    location: string;
    type: GeographyV2Type;
}

// @public (undocumented)
export enum GeographyV2Type {
    // (undocumented)
    City = "city",
    // (undocumented)
    Continent = "continent",
    // (undocumented)
    CountryRegion = "countryRegion",
    // (undocumented)
    POI = "poi",
    // (undocumented)
    State = "state"
}

// @public
export interface InstanceData {
    [propName: string]: any;
    endIndex: number;
    score?: number;
    startIndex: number;
    text: string;
}

// @public
export interface IntentData {
    [propName: string]: any;
    score: number;
}

// @public
export enum JoinOperator {
    AND = "AND",
    OR = "OR"
}

// @public
export interface KnowledgeBaseAnswer {
    // (undocumented)
    answer: string;
    // (undocumented)
    answerSpan: KnowledgeBaseAnswerSpan;
    // (undocumented)
    confidenceScore: number;
    // (undocumented)
    dialog: QnAResponseContext;
    // (undocumented)
    id: number;
    // (undocumented)
    metadata: Map<string, string>;
    // (undocumented)
    questions: string[];
    // (undocumented)
    source: string;
}

// @public
export interface KnowledgeBaseAnswers {
    // (undocumented)
    answers: KnowledgeBaseAnswer[];
}

// @public
export interface KnowledgeBaseAnswerSpan {
    // (undocumented)
    confidenceScore: number;
    // (undocumented)
    length: number;
    // (undocumented)
    offset: number;
    // (undocumented)
    text: string;
}

// @public
export interface ListElement {
    canonicalForm?: string;
    synonyms?: string[];
}

// @public
export class LuisAdaptiveRecognizer extends Recognizer implements LuisAdaptiveRecognizerConfiguration {
    // (undocumented)
    static $kind: string;
    applicationId: StringExpression;
    // Warning: (ae-forgotten-export) The symbol "DynamicList_2" needs to be exported by the entry point index.d.ts
    dynamicLists: ArrayExpression<DynamicList_2>;
    endpoint: StringExpression;
    endpointKey: StringExpression;
    externalEntityRecognizer: Recognizer;
    protected fillRecognizerResultTelemetryProperties(recognizerResult: RecognizerResult, telemetryProperties: {
        [key: string]: string;
    }, dialogContext: DialogContext): {
        [key: string]: string;
    };
    // (undocumented)
    getConverter(property: keyof LuisAdaptiveRecognizerConfiguration): Converter | ConverterFactory;
    logPersonalInformation: BoolExpression;
    // Warning: (ae-forgotten-export) The symbol "LuisAdaptivePredictionOptions" needs to be exported by the entry point index.d.ts
    predictionOptions: LuisAdaptivePredictionOptions;
    recognize(dialogContext: DialogContext, activity: Activity, telemetryProperties?: Record<string, string>, telemetryMetrics?: Record<string, number>): Promise<RecognizerResult>;
    recognizerOptions(dialogContext: DialogContext): LuisRecognizerOptionsV3;
    version: StringExpression;
}

// @public (undocumented)
export interface LuisAdaptiveRecognizerConfiguration extends RecognizerConfiguration {
    // (undocumented)
    applicationId?: string | Expression | StringExpression;
    // (undocumented)
    dynamicLists?: unknown[] | string | Expression | ArrayExpression<unknown>;
    // (undocumented)
    endpoint?: string | Expression | StringExpression;
    // (undocumented)
    endpointKey?: string | Expression | StringExpression;
    // (undocumented)
    externalEntityRecognizer?: string | Recognizer;
    // (undocumented)
    logPersonalInformation?: boolean | string | Expression | BoolExpression;
    // Warning: (ae-forgotten-export) The symbol "LuisAdaptivePredictionOptionsConfiguration" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    predictionOptions?: LuisAdaptivePredictionOptionsConfiguration | LuisAdaptivePredictionOptions;
    // (undocumented)
    version?: string | Expression | StringExpression;
}

// @public
export interface LuisApplication {
    applicationId: string;
    endpoint?: string;
    endpointKey: string;
}

// @public
export class LuisBotComponent extends BotComponent {
    // (undocumented)
    configureServices(services: ServiceCollection, _configuration: Configuration): void;
}

// @public
export class LuisComponentRegistration extends ComponentRegistration {
    constructor();
    getDeclarativeTypes(_resourceExplorer: unknown): ComponentDeclarativeTypes[];
}

// @public
export interface LuisPredictionOptions extends RequestOptionsBase {
    bingSpellCheckSubscriptionKey?: string;
    includeAllIntents?: boolean;
    includeInstanceData?: boolean;
    log?: boolean;
    logPersonalInformation?: boolean;
    spellCheck?: boolean;
    staging?: boolean;
    telemetryClient?: BotTelemetryClient;
    timezoneOffset?: number;
    verbose?: boolean;
}

// @public
export class LuisRecognizer implements LuisRecognizerTelemetryClient {
    constructor(application: string, options?: LuisPredictionOptions, includeApiResults?: boolean);
    constructor(application: LuisApplication, options?: LuisPredictionOptions, includeApiResults?: boolean);
    constructor(application: LuisApplication | string, options?: LuisRecognizerOptionsV3 | LuisRecognizerOptionsV2);
    protected fillTelemetryProperties(recognizerResult: RecognizerResult, turnContext: TurnContext, telemetryProperties?: {
        [key: string]: string;
    }): Promise<{
        [key: string]: string;
    }>;
    get logPersonalInformation(): boolean;
    protected onRecognizerResults(recognizerResult: RecognizerResult, turnContext: TurnContext, telemetryProperties?: {
        [key: string]: string;
    }, telemetryMetrics?: {
        [key: string]: number;
    }): Promise<void>;
    recognize(context: DialogContext | TurnContext, telemetryProperties?: Record<string, string>, telemetryMetrics?: Record<string, number>, options?: LuisRecognizerOptionsV2 | LuisRecognizerOptionsV3 | LuisPredictionOptions): Promise<RecognizerResult>;
    recognize(utterance: string, options?: LuisRecognizerOptionsV2 | LuisRecognizerOptionsV3 | LuisPredictionOptions): Promise<RecognizerResult>;
    static sortedIntents(result?: RecognizerResult, minScore?: number): Array<{
        intent: string;
        score: number;
    }>;
    get telemetryClient(): BotTelemetryClient;
    static topIntent(results?: RecognizerResult, defaultIntent?: string, minScore?: number): string;
}

// @public (undocumented)
export interface LuisRecognizerOptions {
    includeAPIResults?: boolean;
    logPersonalInformation?: boolean;
    telemetryClient?: BotTelemetryClient;
}

// @public (undocumented)
export interface LuisRecognizerOptionsV2 extends LuisRecognizerOptions {
    apiVersion: 'v2';
    bingSpellCheckSubscriptionKey?: string;
    includeAllIntents?: boolean;
    includeInstanceData?: boolean;
    log?: boolean;
    spellCheck?: boolean;
    staging?: boolean;
    timezoneOffset?: number;
}

// @public (undocumented)
export interface LuisRecognizerOptionsV3 extends LuisRecognizerOptions {
    apiVersion: 'v3';
    datetimeReference?: string;
    dynamicLists?: Array<DynamicList>;
    externalEntities?: Array<ExternalEntity>;
    externalEntityRecognizer?: Recognizer;
    includeAllIntents?: boolean;
    includeInstanceData?: boolean;
    log?: boolean;
    preferExternalEntities?: boolean;
    slot?: 'production' | 'staging';
    version?: string;
}

// @public (undocumented)
export interface LuisRecognizerTelemetryClient {
    readonly logPersonalInformation: boolean;
    recognize(context: TurnContext, telemetryProperties?: {
        [key: string]: string;
    }, telemetryMetrics?: {
        [key: string]: number;
    }): Promise<RecognizerResult>;
    readonly telemetryClient: BotTelemetryClient;
}

// @public
export class LuisTelemetryConstants {
    // (undocumented)
    static readonly activityIdProperty = "activityId";
    // (undocumented)
    static readonly applicationIdProperty = "applicationId";
    // (undocumented)
    static readonly entitiesProperty = "entities";
    // (undocumented)
    static readonly fromIdProperty = "fromId";
    // (undocumented)
    static readonly intent2Property = "intent2";
    // (undocumented)
    static readonly intentProperty = "intent";
    // (undocumented)
    static readonly intentScore2Property = "intentScore2";
    // (undocumented)
    static readonly intentScoreProperty = "intentScore";
    // (undocumented)
    static readonly luisResultEvent = "LuisResult";
    // (undocumented)
    static readonly questionProperty = "question";
    // (undocumented)
    static readonly sentimentLabelProperty = "sentimentLabel";
    // (undocumented)
    static readonly sentimentScoreProperty = "sentimentScore";
}

// @public
export interface MetadataFilter {
    // (undocumented)
    logicalOperation: string;
    // (undocumented)
    metadata: Array<{
        key: string;
        value: string;
    }>;
}

// @public
export interface NumberWithUnits {
    number?: number;
    units: string;
}

// @public
export interface OrdinalV2 {
    offset: number;
    relativeTo: Anchor;
}

// @public
export class QnACardBuilder {
    static getHeroCard(cardText: string, buttonList: any[]): Attachment;
    static getQnAAnswerCard(result: QnAMakerResult, displayPreciseAnswerOnly: boolean, useTeamsAdaptiveCard?: boolean): Partial<Activity>;
    static getQnAPromptsCard(result: QnAMakerResult): Partial<Activity>;
    static getSuggestionsCard(suggestionsList: string[], cardTitle: string, cardNoMatchText: string, useTeamsAdaptiveCard?: boolean): Partial<Activity>;
    static getTeamsAdaptiveCard(cardText: string, buttonList: any[]): Attachment;
}

// @public
export class QnAMaker implements QnAMakerClient, QnAMakerTelemetryClient {
    constructor(endpoint: QnAMakerEndpoint, options?: QnAMakerOptions, telemetryClient?: BotTelemetryClient, logPersonalInformation?: boolean);
    // @deprecated
    answer(context: TurnContext): Promise<boolean>;
    protected callService(endpoint: QnAMakerEndpoint, question: string, top: number): Promise<QnAMakerResults>;
    callTrain(feedbackRecords: FeedbackRecords): Promise<void>;
    protected fillQnAEvent(qnaResults: QnAMakerResult[], turnContext: TurnContext, telemetryProperties?: Record<string, string>, telemetryMetrics?: Record<string, number>): Promise<[Record<string, string>, Record<string, number>]>;
    // @deprecated
    generateAnswer(question: string | undefined, top?: number, _scoreThreshold?: number): Promise<QnAMakerResult[]>;
    getAnswers(context: TurnContext, options?: QnAMakerOptions, telemetryProperties?: {
        [key: string]: string;
    }, telemetryMetrics?: {
        [key: string]: number;
    }): Promise<QnAMakerResult[]>;
    getAnswersRaw(context: TurnContext, options: QnAMakerOptions, telemetryProperties: {
        [key: string]: string;
    }, telemetryMetrics: {
        [key: string]: number;
    }): Promise<QnAMakerResults>;
    getLegacyAnswersRaw(context: TurnContext, options?: QnAMakerOptions, telemetryProperties?: {
        [key: string]: string;
    }, telemetryMetrics?: {
        [key: string]: number;
    }): Promise<QnAMakerResults>;
    getLowScoreVariation(queryResult: QnAMakerResult[]): QnAMakerResult[];
    get logPersonalInformation(): boolean;
    protected onQnaResults(qnaResults: QnAMakerResult[], turnContext: TurnContext, telemetryProperties?: {
        [key: string]: string;
    }, telemetryMetrics?: {
        [key: string]: number;
    }): Promise<void>;
    get telemetryClient(): BotTelemetryClient;
}

// @public (undocumented)
export const QNAMAKER_TRACE_LABEL = "QnAMaker Trace";

// @public (undocumented)
export const QNAMAKER_TRACE_NAME = "QnAMaker";

// @public (undocumented)
export const QNAMAKER_TRACE_TYPE = "https://www.qnamaker.ai/schemas/trace";

// @public
export class QnAMakerBotComponent extends BotComponent {
    // (undocumented)
    configureServices(services: ServiceCollection, _configuration: Configuration): void;
}

// @public
export interface QnAMakerClient {
    callTrain(feedbackRecords: FeedbackRecords): Promise<void>;
    getAnswers(turnContext: TurnContext, options?: QnAMakerOptions, telemetryProperties?: Record<string, string>, telemetryMetrics?: Record<string, number>): Promise<QnAMakerResult[]>;
    getAnswersRaw(turnContext: TurnContext, options?: QnAMakerOptions, telemetryProperties?: Record<string, string>, telemetryMetrics?: Record<string, number>): Promise<QnAMakerResults>;
    getLowScoreVariation(queryResult: QnAMakerResult[]): QnAMakerResult[];
}

// @public
export const QnAMakerClientKey: unique symbol;

// @public
export class QnAMakerComponentRegistration extends ComponentRegistration {
    constructor();
    getDeclarativeTypes(_resourceExplorer: unknown): ComponentDeclarativeTypes[];
}

// Warning: (ae-forgotten-export) The symbol "QnAMakerDialogConfiguration" needs to be exported by the entry point index.d.ts
//
// @public
export class QnAMakerDialog extends WaterfallDialog implements QnAMakerDialogConfiguration {
    // (undocumented)
    static $kind: string;
    constructor(knowledgeBaseId?: string, endpointKey?: string, hostname?: string, noAnswer?: Activity, threshold?: number, activeLearningCardTitle?: string, cardNoMatchText?: string, top?: number, cardNoMatchResponse?: Activity, rankerType?: RankerTypes, strictFilters?: QnAMakerMetadata[], dialogId?: string, strictFiltersJoinOperator?: JoinOperator, enablePreciseAnswer?: boolean, displayPreciseAnswerOnly?: boolean, qnaServiceType?: ServiceType, useTeamsAdaptiveCard?: boolean);
    constructor(knowledgeBaseId?: string, endpointKey?: string, hostname?: string, noAnswer?: Activity, threshold?: number, suggestionsActivityFactory?: QnASuggestionsActivityFactory, cardNoMatchText?: string, top?: number, cardNoMatchResponse?: Activity, rankerType?: RankerTypes, strictFilters?: QnAMakerMetadata[], dialogId?: string, strictFiltersJoinOperator?: JoinOperator, enablePreciseAnswer?: boolean, displayPreciseAnswerOnly?: boolean, qnaServiceType?: ServiceType, useTeamsAdaptiveCard?: boolean);
    activeLearningCardTitle: StringExpression;
    beginDialog(dc: DialogContext, options?: object): Promise<DialogTurnResult>;
    cardNoMatchResponse: TemplateInterface<Partial<Activity>, DialogStateManager>;
    cardNoMatchText: StringExpression;
    continueDialog(dc: DialogContext): Promise<DialogTurnResult>;
    protected defaultThreshold: number;
    protected defaultTopN: number;
    displayPreciseAnswerOnly: boolean;
    protected displayQnAResult(step: WaterfallStepContext): Promise<DialogTurnResult>;
    enablePreciseAnswer: boolean;
    endpointKey: StringExpression;
    filters: Filters;
    // (undocumented)
    getConverter(property: keyof QnAMakerDialogConfiguration): Converter | ConverterFactory;
    protected getQnAMakerClient(dc: DialogContext): Promise<QnAMakerClient>;
    protected getQnAMakerOptions(dc: DialogContext): Promise<QnAMakerOptions>;
    protected getQnAResponseOptions(dc: DialogContext): Promise<QnAMakerDialogResponseOptions>;
    hostname: StringExpression;
    includeUnstructuredSources: boolean;
    isTest: boolean;
    knowledgeBaseId: StringExpression;
    logPersonalInformation: BoolExpression;
    noAnswer: TemplateInterface<Partial<Activity>, DialogStateManager>;
    protected onPreBubbleEvent(dc: DialogContext, e: DialogEvent): Promise<boolean>;
    protected options: string;
    protected previousQnAId: string;
    protected qnAContextData: string;
    qnaServiceType: ServiceType;
    rankerType: EnumExpression<RankerTypes>;
    strictFilters: QnAMakerMetadata[];
    strictFiltersJoinOperator: JoinOperator;
    threshold: NumberExpression;
    top: IntExpression;
    useTeamsAdaptiveCard: boolean;
}

// @public
export interface QnAMakerDialogOptions {
    qnaDialogResponseOptions: QnAMakerDialogResponseOptions;
    qnaMakerOptions: QnAMakerOptions;
}

// @public
export interface QnAMakerDialogResponseOptions {
    activeLearningCardTitle: string;
    cardNoMatchResponse: Partial<Activity>;
    cardNoMatchText: string;
    displayPreciseAnswerOnly: boolean;
    noAnswer: Partial<Activity>;
}

// @public
export interface QnAMakerEndpoint {
    endpointKey: string;
    host: string;
    knowledgeBaseId: string;
    qnaServiceType?: ServiceType;
}

// @public
export interface QnAMakerMetadata {
    name: string;
    value: string;
}

// @public
export interface QnAMakerOptions {
    context?: QnARequestContext;
    enablePreciseAnswer?: boolean;
    // (undocumented)
    filters?: Filters;
    includeUnstructuredSources?: boolean;
    isTest?: boolean;
    metadataBoost?: QnAMakerMetadata[];
    qnaId?: number;
    rankerType?: string;
    scoreThreshold?: number;
    strictFilters?: QnAMakerMetadata[];
    strictFiltersJoinOperator?: JoinOperator;
    timeout?: number;
    top?: number;
    userId?: string;
}

// @public
export interface QnAMakerPrompt {
    displayOrder: number;
    displayText: string;
    qna?: object;
    qnaId: number;
}

// @public
export class QnAMakerRecognizer extends Recognizer implements QnAMakerRecognizerConfiguration {
    // (undocumented)
    static $kind: string;
    constructor(hostname?: string, knowledgeBaseId?: string, endpointKey?: string);
    context: ObjectExpression<QnARequestContext>;
    endpointKey: StringExpression;
    protected fillRecognizerResultTelemetryProperties(recognizerResult: RecognizerResult, telemetryProperties: Record<string, string>, dc: DialogContext): Record<string, string>;
    // (undocumented)
    getConverter(property: keyof QnAMakerRecognizerConfiguration): Converter | ConverterFactory;
    // @deprecated
    protected getQnAMaker(dc: DialogContext): QnAMaker;
    protected getQnAMakerClient(dc: DialogContext): QnAMakerClient;
    hostname: StringExpression;
    includeDialogNameInMetadata: BoolExpression;
    isTest: boolean;
    knowledgeBaseId: StringExpression;
    logPersonalInformation: BoolExpression;
    metadata: ArrayExpression<QnAMakerMetadata>;
    qnaId: IntExpression;
    // (undocumented)
    static readonly qnaMatchIntent = "QnAMatch";
    rankerType: StringExpression;
    recognize(dc: DialogContext, activity: Activity, telemetryProperties?: {
        [key: string]: string;
    }, telemetryMetrics?: {
        [key: string]: number;
    }): Promise<RecognizerResult>;
    strictFiltersJoinOperator: JoinOperator;
    threshold: NumberExpression;
    top: IntExpression;
}

// @public (undocumented)
export interface QnAMakerRecognizerConfiguration extends RecognizerConfiguration {
    // (undocumented)
    context?: QnARequestContext | string | Expression | ObjectExpression<QnARequestContext>;
    // (undocumented)
    endpointKey?: string | Expression | StringExpression;
    // (undocumented)
    hostname?: string | Expression | StringExpression;
    // (undocumented)
    includeDialogNameInMetadata?: boolean | string | Expression | BoolExpression;
    // (undocumented)
    isTest?: boolean;
    // (undocumented)
    knowledgeBaseId?: string | Expression | StringExpression;
    // (undocumented)
    logPersonalInformation?: boolean | string | Expression | BoolExpression;
    // (undocumented)
    metadata?: QnAMakerMetadata[] | string | Expression | ArrayExpression<QnAMakerMetadata>;
    // (undocumented)
    qnaId?: number | string | Expression | IntExpression;
    // (undocumented)
    rankerType?: string | Expression | StringExpression;
    // (undocumented)
    strictFiltersJoinOperator?: JoinOperator;
    // (undocumented)
    threshold?: number | string | Expression | NumberExpression;
    // (undocumented)
    top?: number | string | Expression | IntExpression;
}

// @public
export interface QnAMakerResult {
    answer: string;
    answerSpan?: AnswerSpanResponse;
    context?: QnAResponseContext;
    id?: number;
    metadata?: any;
    questions?: string[];
    score: number;
    source?: string;
}

// @public
export interface QnAMakerResults {
    activeLearningEnabled?: boolean;
    answers?: QnAMakerResult[];
}

// @public
export interface QnAMakerTelemetryClient {
    getAnswers(context: TurnContext, options?: QnAMakerOptions, telemetryProperties?: {
        [key: string]: string;
    }, telemetryMetrics?: {
        [key: string]: number;
    }): Promise<QnAMakerResult[]>;
    readonly logPersonalInformation: boolean;
    readonly telemetryClient: BotTelemetryClient;
}

// @public
export interface QnAMakerTraceInfo {
    context?: QnARequestContext;
    knowledgeBaseId: string;
    message: Activity;
    metadataBoost: any[];
    qnaId?: number;
    queryResults: QnAMakerResult[];
    scoreThreshold: number;
    strictFilters: any[];
    top: number;
}

// @public
export interface QnARequestContext {
    previousQnAId: number;
    previousUserQuery: string;
}

// @public
export interface QnAResponseContext {
    prompts: QnAMakerPrompt[];
}

// @public
export type QnASuggestionsActivityFactory = (suggestionsList: string[], noMatchesText: string) => Partial<Activity>;

// @public
export enum RankerTypes {
    autoSuggestQuestion = "AutoSuggestQuestion",
    default = "Default",
    questionOnly = "QuestionOnly"
}

// @public
export enum ServiceType {
    language = "Language",
    qnaMaker = "QnAMaker"
}

// @public
export function validateDynamicList(dynamicList: DynamicList): void;

// @public
export function validateExternalEntity(entity: ExternalEntity): void;

// @public
export function validateListElement(element: ListElement): void;

// (No @packageDocumentation comment for this package)

```
