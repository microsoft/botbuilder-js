/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { LUISRuntimeModels as LuisModels } from '@azure/cognitiveservices-luis-runtime';

import Url from 'url-parse';
import { BotTelemetryClient, NullTelemetryClient, RecognizerResult, TurnContext } from 'botbuilder-core';
import { LuisTelemetryConstants } from './luisTelemetryConstants';
import { isLuisRecognizerOptionsV2, LuisRecognizerV2 } from './luisRecognizerOptionsV2';
import { isLuisRecognizerOptionsV3, LuisRecognizerV3 } from './luisRecognizerOptionsV3';
import { DynamicList } from './dynamicList';
import { ExternalEntity } from './externalEntity';
import { DialogContext, Recognizer } from 'botbuilder-dialogs';
import * as z from 'zod';

/**
 * Description of a LUIS application used for initializing a LuisRecognizer.
 */
export interface LuisApplication {
    /**
     * Your models application Id from LUIS
     */
    applicationId: string;

    /**
     *  (Optional) LUIS endpoint with a default of https://westus.api.cognitive.microsoft.com
     */
    endpoint?: string;

    /**
     * Endpoint key for talking to LUIS
     */
    endpointKey: string;
}

/**
 *
 * Options per LUIS prediction.
 */
export interface LuisPredictionOptions extends LuisModels.PredictionResolveOptionalParams {
    /**
     * (Optional) Bing Spell Check subscription key.
     */
    bingSpellCheckSubscriptionKey?: string;

    /**
     * (Optional) Determine if all intents come back or only the top one.
     */
    includeAllIntents?: boolean;

    /**
     * (Optional) A value indicating whether or not instance data should be included in response.
     */
    includeInstanceData?: boolean;

    /**
     * (Optional) If queries should be logged in LUIS.
     */
    log?: boolean;

    /**
     * (Optional) Whether to spell check query.
     */
    spellCheck?: boolean;

    /**
     * (Optional) Whether to use the staging endpoint.
     */
    staging?: boolean;

    /**
     * (Optional) The time zone offset for resolving datetimes.
     */
    timezoneOffset?: number;

    /**
     * (Optional) Telemetry Client.
     */
    telemetryClient?: BotTelemetryClient;

    /**
     * (Optional) Designates whether personal information should be logged in telemetry.
     */
    logPersonalInformation?: boolean;
}

export interface LuisRecognizerTelemetryClient {
    /**
     * Gets a value indicating whether determines whether to log personal information that came from the user.
     */
    readonly logPersonalInformation: boolean;

    /**
     * Gets the currently configured botTelemetryClient that logs the events.
     */
    readonly telemetryClient: BotTelemetryClient;

    /**
     * Calls LUIS to recognize intents and entities in a users utterance.
     *
     * @summary
     * Returns a [RecognizerResult](../botbuilder-core/recognizerresult) containing any intents and entities recognized by LUIS.
     *
     * @param {TurnContext} context Context for the current turn of conversation with the use.
     * @param {object} telemetryProperties Additional properties to be logged to telemetry with the LuisResult event.
     * @param {object} telemetryMetrics Additional metrics to be logged to telemetry with the LuisResult event.
     * @returns {Promise<RecognizerResult>} A promise that resolves to the recognizer result.
     */
    recognize(
        context: TurnContext,
        telemetryProperties?: { [key: string]: string },
        telemetryMetrics?: { [key: string]: number }
    ): Promise<RecognizerResult>;
}

export interface LuisRecognizerOptions {
    /**
     * (Optional) Telemetry Client.
     */
    telemetryClient?: BotTelemetryClient;
    /**
     * (Optional) Designates whether personal information should be logged in telemetry.
     */
    logPersonalInformation?: boolean;

    /**
     * (Optional) Force the inclusion of LUIS Api call in results returned by [recognize()](#recognize). Defaults to a value of `false`
     */
    includeAPIResults?: boolean;
}

export interface LuisRecognizerOptionsV3 extends LuisRecognizerOptions {
    /**
     * (Optional) Luis Api endpoint version.
     */
    apiVersion: 'v3';

    /**
     * (Optional) External recognizer to recognize external entities to pass to LUIS.
     */
    externalEntityRecognizer?: Recognizer;

    /**
     * (Optional) Determine if all intents come back or only the top one.
     */
    includeAllIntents?: boolean;

    /**
     * (Optional) A value indicating whether or not instance data should be included in response.
     */
    includeInstanceData?: boolean;

    /**
     * (Optional) If queries should be logged in LUIS.
     */
    log?: boolean;

    /**
     * (Optional) Dynamic lists of things like contact names to recognize at query time..
     */
    dynamicLists?: Array<DynamicList>;

    /**
     * (Optional) External entities recognized in query.
     */
    externalEntities?: Array<ExternalEntity>;

    /**
     * (Optional) Boolean for if external entities should be preferred to the results from LUIS models.
     */
    preferExternalEntities?: boolean;

    /**
     * (Optional) Timezone applied to datetimeV2 entities.
     */
    datetimeReference?: string;

    /**
     * (Optional) By default this uses the production slot.  You can find other standard slots in <see cref="LuisSlot"/>.
     *  If you specify a Version, then a private version of the application is used instead of a slot.
     */
    slot?: 'production' | 'staging';

    /**
     * (Optional) LUIS supports versions and this is the version to use instead of a slot.
     * If this is specified, then the <see cref="Slot"/> is ignored..
     */
    version?: string;
}

export interface LuisRecognizerOptionsV2 extends LuisRecognizerOptions {
    /**
     * Luis Api endpoint version.
     */
    apiVersion: 'v2';

    /**
     * (Optional) Bing Spell Check subscription key.
     */
    bingSpellCheckSubscriptionKey?: string;

    /**
     * (Optional) Determine if all intents come back or only the top one.
     */
    includeAllIntents?: boolean;

    /**
     * (Optional) A value indicating whether or not instance data should be included in response.
     */
    includeInstanceData?: boolean;

    /**
     * (Optional) If queries should be logged in LUIS.
     */
    log?: boolean;

    /**
     * (Optional) Whether to spell check query.
     */
    spellCheck?: boolean;

    /**
     * (Optional) Whether to use the staging endpoint.
     */
    staging?: boolean;

    /**
     * (Optional) The time zone offset for resolving datetimes.
     */
    timezoneOffset?: number;
}

// This zod type is purely used for type assertions in a scenario where we
// know better than the compiler does that we'll have a value of this type.
// This is just meant to operate as a simple type assertion.
const UnsafeLuisRecognizerUnion = z.custom<LuisRecognizerOptionsV3 | LuisRecognizerOptionsV2 | LuisPredictionOptions>(
    (val: unknown): val is LuisRecognizerOptionsV3 | LuisRecognizerOptionsV2 | LuisPredictionOptions =>
        z.record(z.unknown()).check(val),
    {
        message: 'LuisRecognizerOptionsV3 | LuisRecognizerOptionsV2 | LuisPredictionOptions',
    }
);

/**
 * Recognize intents in a user utterance using a configured LUIS model.
 *
 * @summary
 * This class is used to recognize intents and extract entities from incoming messages.
 * See this class in action [in this sample application](https://github.com/microsoft/BotBuilder-Samples/tree/main/samples/javascript_nodejs/14.nlp-with-dispatch).
 *
 * This component can be used within your bots logic by calling [recognize()](#recognize).
 */
export class LuisRecognizer implements LuisRecognizerTelemetryClient {
    private readonly _logPersonalInformation: boolean;
    private readonly _telemetryClient: BotTelemetryClient;

    private application: LuisApplication;
    private options: LuisPredictionOptions;

    private cacheKey: string;
    private luisRecognizerInternal: LuisRecognizerV2 | LuisRecognizerV3;

    /**
     * Creates a new [LuisRecognizer](xref:botbuilder-ai.LuisRecognizer) instance.
     *
     * @param application The LUIS application endpoint, usually retrieved from https://luis.ai.
     * @param options Optional. Options object used to control predictions. Should conform to the [LuisPredictionOptions](xref:botbuilder-ai.LuisPredictionOptions) definition.
     * @param includeApiResults (Deprecated) Flag that if set to `true` will force the inclusion of LUIS Api call in results returned by the [LuisRecognizer.recognize](xref:botbuilder-ai.LuisRecognizer.recognize) method. Defaults to a value of `false`.
     */
    constructor(application: string, options?: LuisPredictionOptions, includeApiResults?: boolean);
    /**
     * Creates a new [LuisRecognizer](xref:botbuilder-ai.LuisRecognizer) instance.
     *
     * @param application An object conforming to the [LuisApplication](xref:botbuilder-ai.LuisApplication) definition.
     * @param options Optional. Options object used to control predictions. Should conform to the [LuisPredictionOptions](xref:botbuilder-ai.LuisPredictionOptions) definition.
     * @param includeApiResults (Deprecated) Flag that if set to `true` will force the inclusion of LUIS Api call in results returned by the [LuisRecognizer.recognize](xref:botbuilder-ai.LuisRecognizer.recognize) method. Defaults to a value of `false`.
     */
    constructor(application: LuisApplication, options?: LuisPredictionOptions, includeApiResults?: boolean);
    /**
     * Creates a new [LuisRecognizer](xref:botbuilder-ai.LuisRecognizer) instance.
     *
     * @param application An object conforming to the [LuisApplication](xref:botbuilder-ai.LuisApplication) definition or a string representing a LUIS application endpoint, usually retrieved from https://luis.ai.
     * @param options Optional. Options object used to control predictions. Should conform to the [LuisRecognizerOptionsV3](xref:botbuilder-ai.LuisRecognizerOptionsV3) or [LuisRecognizerOptionsV2](xref:botbuilder-ai.LuisRecognizerOptionsV2) definition.
     */
    constructor(application: LuisApplication | string, options?: LuisRecognizerOptionsV3 | LuisRecognizerOptionsV2);
    /**
     * Creates a new [LuisRecognizer](xref:botbuilder-ai.LuisRecognizer) instance.
     *
     * @param {LuisApplication | string} application An object conforming to the [LuisApplication](xref:botbuilder-ai.LuisApplication) definition or a string representing a LUIS application endpoint, usually retrieved from https://luis.ai.
     * @param {LuisRecognizerOptionsV3 | LuisRecognizerOptionsV2 | LuisPredictionOptions} options Optional. Options object used to control predictions. Should conform to the [LuisPredictionOptions](xref:botbuilder-ai.LuisPredictionOptions), [LuisRecognizerOptionsV3](xref:botbuilder-ai.LuisRecognizerOptionsV3) or [LuisRecognizerOptionsV2](xref:botbuilder-ai.LuisRecognizerOptionsV2) definition.
     * @param {boolean} includeApiResults (Deprecated) Flag that if set to `true` will force the inclusion of LUIS Api call in results returned by the [LuisRecognizer.recognize](xref:botbuilder-ai.LuisRecognizer.recognize) method. Defaults to a value of `false`.
     */
    constructor(
        application: LuisApplication | string,
        options?: LuisRecognizerOptionsV3 | LuisRecognizerOptionsV2 | LuisPredictionOptions,
        includeApiResults?: boolean
    ) {
        if (typeof application === 'string') {
            const parsedEndpoint: Url = Url(application);
            // Use exposed querystringify to parse the query string for the endpointKey value.
            const parsedQuery = Url.qs.parse(parsedEndpoint.query);
            this.application = {
                applicationId: parsedEndpoint.pathname.split('apps/')[1],
                // Note: The query string parser bundled with url-parse can return "null" as a value for the origin.
                endpoint: parsedEndpoint.origin,
                endpointKey: parsedQuery['subscription-key'],
            };
        } else {
            const { applicationId, endpoint, endpointKey } = application;
            this.application = {
                applicationId: applicationId,
                endpoint: endpoint,
                endpointKey: endpointKey,
            };
        }
        this.validateLuisApplication();
        this.cacheKey = this.application.endpoint + this.application.applicationId;
        this._telemetryClient = (options && options.telemetryClient) || new NullTelemetryClient();
        this._logPersonalInformation = (options && options.logPersonalInformation) || false;

        if (!options) {
            this.luisRecognizerInternal = new LuisRecognizerV2(this.application);
        } else if (isLuisRecognizerOptionsV3(options)) {
            this.luisRecognizerInternal = new LuisRecognizerV3(this.application, options);
        } else if (isLuisRecognizerOptionsV2(options)) {
            this.luisRecognizerInternal = new LuisRecognizerV2(this.application, options);
        } else {
            this.options = {
                ...options,
            };

            const recOptions: LuisRecognizerOptionsV2 = {
                includeAPIResults: !!includeApiResults,
                ...options,
                apiVersion: 'v2',
            };

            this.luisRecognizerInternal = new LuisRecognizerV2(this.application, recOptions);
        }
    }

    /**
     * Gets a value indicating whether determines whether to log personal information that came from the user.
     *
     * @returns True if will log personal information into the BotTelemetryClient.TrackEvent method; otherwise the properties will be filtered.
     */
    get logPersonalInformation(): boolean {
        return this._logPersonalInformation;
    }

    /**
     * Gets the currently configured BotTelemetryClient that logs the events.
     *
     * @returns Currently configured BotTelemetryClient that logs the LuisResult event.
     */
    get telemetryClient(): BotTelemetryClient {
        return this._telemetryClient;
    }

    /**
     * Returns the name of the top scoring intent from a set of LUIS results.
     *
     * @param {RecognizerResult} results Result set to be searched.
     * @param {string} defaultIntent (Optional) intent name to return should a top intent be found. Defaults to a value of `None`.
     * @param {number} minScore (Optional) minimum score needed for an intent to be considered as a top intent. If all intents in the set are below this threshold then the `defaultIntent` will be returned.  Defaults to a value of `0.0`.
     * @returns {string} the top intent
     */
    static topIntent(results?: RecognizerResult, defaultIntent = 'None', minScore = 0): string {
        const sortedIntents = this.sortedIntents(results, minScore);
        const topIntent = sortedIntents[0];
        return topIntent?.intent || defaultIntent; // Note: `||` is intentionally not `??` and is covered by tests
    }

    /**
     * Sorts recognizer result intents in ascending order by score, filtering those that
     * have scores less that `minScore`.
     *
     * @param {RecognizerResult} result recognizer result to be sorted and filtered
     * @param {number} minScore minimum score threshold, lower score results will be filtered
     * @returns {Array<{intent: string; score: number}>} sorted result intents
     */
    static sortedIntents(result?: RecognizerResult, minScore = 0): Array<{ intent: string; score: number }> {
        return Object.entries(result?.intents ?? {})
            .map(([intent, { score = 0 }]) => ({ intent, score }))
            .filter(({ score }) => score > minScore)
            .sort(({ score: left }, { score: right }) => {
                if (left > right) {
                    return -1;
                } else if (left < right) {
                    return 1;
                } else {
                    return 0;
                }
            });
    }

    /**
     * Calls LUIS to recognize intents and entities in a users utterance.
     *
     * @summary
     * Returns a [RecognizerResult](../botbuilder-core/recognizerresult) containing any intents and entities recognized by LUIS.
     *
     * In addition to returning the results from LUIS, [recognize()](#recognize) will also
     * emit a trace activity that contains the LUIS results.
     *
     * Here is an example of recognize being used within a bot's turn handler: to interpret an incoming message:
     *
     * ```javascript
     * async onTurn(context) {
     *     if (turnContext.activity.type === ActivityTypes.Message) {
     *         const results = await luisRecognizer.recognize(turnContext);
     *         const topIntent = LuisRecognizer.topIntent(results);
     *         switch (topIntent) {
     *             case 'MyIntent':
     *                 // ... handle intent ...
     *                 break;
     *             case 'None':
     *                 // ... handle intent ...
     *                 break;
     *         }
     *     }
     * }
     * ```
     *
     * @param {DialogContext | TurnContext} context Context for the current turn of conversation with the use.
     * @param {object} telemetryProperties Additional properties to be logged to telemetry with the LuisResult event.
     * @param {object} telemetryMetrics Additional metrics to be logged to telemetry with the LuisResult event.
     * @param {LuisRecognizerOptionsV2 | LuisRecognizerOptionsV3 | LuisPredictionOptions} options (Optional) options object used to override control predictions. Should conform to the [LuisRecognizerOptionsV2] or [LuisRecognizerOptionsV3] definition.
     * @returns {Promise<RecognizerResult>} A promise that resolved to the recognizer result.
     */
    async recognize(
        context: DialogContext | TurnContext,
        telemetryProperties?: Record<string, string>,
        telemetryMetrics?: Record<string, number>,
        options?: LuisRecognizerOptionsV2 | LuisRecognizerOptionsV3 | LuisPredictionOptions
    ): Promise<RecognizerResult>;

    /**
     * Calls LUIS to recognize intents and entities in a users utterance.
     *
     * @param {string} utterance The utterance to be recognized.
     * @param {LuisRecognizerOptionsV2 | LuisRecognizerOptionsV3 | LuisPredictionOptions} options (Optional) options object used to override control predictions. Should conform to the [LuisRecognizerOptionsV2] or [LuisRecognizerOptionsV3] definition.
     */
    async recognize(
        utterance: string,
        options?: LuisRecognizerOptionsV2 | LuisRecognizerOptionsV3 | LuisPredictionOptions
    ): Promise<RecognizerResult>;

    /**
     * @internal
     */
    async recognize(
        contextOrUtterance: DialogContext | TurnContext | string,
        maybeTelemetryPropertiesOrOptions?:
            | Record<string, string>
            | LuisRecognizerOptionsV2
            | LuisRecognizerOptionsV3
            | LuisPredictionOptions,
        maybeTelemetryMetrics?: Record<string, number>,
        maybeOptions?: LuisRecognizerOptionsV2 | LuisRecognizerOptionsV3 | LuisPredictionOptions
    ): Promise<RecognizerResult> {
        // This type check, when true, logically implies that the function is being invoked as the two-argument string + optional options overload variant.
        if (typeof contextOrUtterance === 'string') {
            const utterance = contextOrUtterance;

            const options = UnsafeLuisRecognizerUnion.optional().nullable().parse(maybeTelemetryPropertiesOrOptions);

            const luisRecognizer = options ? this.buildRecognizer(options) : this.luisRecognizerInternal;

            return luisRecognizer.recognizeInternal(utterance);
        } else {
            const telemetryProperties = z
                .record(z.string())
                .optional()
                .nullable()
                .parse(maybeTelemetryPropertiesOrOptions);

            const turnContext =
                contextOrUtterance instanceof DialogContext ? contextOrUtterance.context : contextOrUtterance;
            const cached = turnContext.turnState.get(this.cacheKey);

            if (!cached) {
                const utterance = turnContext.activity.text || '';
                let recognizerPromise: Promise<RecognizerResult>;

                if (!utterance.trim()) {
                    // Bypass LUIS if the activity's text is null or whitespace
                    recognizerPromise = Promise.resolve({
                        text: utterance,
                        intents: { '': { score: 1 } },
                        entities: {},
                    });
                } else {
                    const luisRecognizer = maybeOptions
                        ? this.buildRecognizer(maybeOptions)
                        : this.luisRecognizerInternal;
                    recognizerPromise = luisRecognizer.recognizeInternal(turnContext);
                }

                try {
                    const recognizerResult = await recognizerPromise;
                    // Write to cache
                    turnContext.turnState.set(this.cacheKey, recognizerResult);
                    this._telemetryClient.trackEvent({
                        name: 'Luis result cached',
                        properties: telemetryProperties,
                        metrics: maybeTelemetryMetrics,
                    });
                    // Log telemetry
                    this.onRecognizerResults(recognizerResult, turnContext, telemetryProperties, maybeTelemetryMetrics);
                    return recognizerResult;
                } catch (error) {
                    this.prepareErrorMessage(error);
                    throw error;
                }
            }

            this._telemetryClient.trackEvent({
                name: 'Read from cached Luis result',
                properties: telemetryProperties,
                metrics: maybeTelemetryMetrics,
            });
            return cached;
        }
    }

    /**
     * Invoked prior to a LuisResult Event being logged.
     *
     * @param {RecognizerResult} recognizerResult The Luis Results for the call.
     * @param {TurnContext} turnContext Context object containing information for a single turn of conversation with a user.
     * @param {object} telemetryProperties Additional properties to be logged to telemetry with the LuisResult event.
     * @param {object} telemetryMetrics Additional metrics to be logged to telemetry with the LuisResult event.
     */
    protected async onRecognizerResults(
        recognizerResult: RecognizerResult,
        turnContext: TurnContext,
        telemetryProperties?: { [key: string]: string },
        telemetryMetrics?: { [key: string]: number }
    ): Promise<void> {
        await this.fillTelemetryProperties(recognizerResult, turnContext, telemetryProperties).then((props) => {
            this.telemetryClient.trackEvent({
                name: LuisTelemetryConstants.luisResultEvent,
                properties: props,
                metrics: telemetryMetrics,
            });
        });
    }

    /**
     * Fills the event properties for LuisResult event for telemetry. These properties are logged when the recognizer is called.
     *
     * @param {RecognizerResult} recognizerResult Last activity sent from user.
     * @param {TurnContext} turnContext Context object containing information for a single turn of conversation with a user.
     * @param {object} telemetryProperties Additional properties to be logged to telemetry with the LuisResult event.
     * @returns {Promise<object>} A dictionary that is sent as properties to BotTelemetryClient.trackEvent method for the LuisResult event.
     */
    protected async fillTelemetryProperties(
        recognizerResult: RecognizerResult,
        turnContext: TurnContext,
        telemetryProperties?: { [key: string]: string }
    ): Promise<{ [key: string]: string }> {
        const [firstIntent, secondIntent] = LuisRecognizer.sortedIntents(recognizerResult);

        // Add the intent score and conversation id properties
        const properties: { [key: string]: string } = {};

        properties[LuisTelemetryConstants.applicationIdProperty] = this.application.applicationId;

        properties[LuisTelemetryConstants.intentProperty] = firstIntent?.intent ?? '';
        properties[LuisTelemetryConstants.intentScoreProperty] = (firstIntent?.score ?? 0).toString();

        properties[LuisTelemetryConstants.intent2Property] = secondIntent?.intent ?? '';
        properties[LuisTelemetryConstants.intentScore2Property] = (secondIntent?.score ?? 0).toString();

        if (turnContext.activity.from) {
            properties[LuisTelemetryConstants.fromIdProperty] = turnContext.activity.from.id;
        }

        if (recognizerResult.sentiment) {
            if (recognizerResult.sentiment.label) {
                properties[LuisTelemetryConstants.sentimentLabelProperty] = recognizerResult.sentiment.label;
            }

            if (recognizerResult.sentiment.score) {
                properties[LuisTelemetryConstants.sentimentScoreProperty] = recognizerResult.sentiment.score.toString();
            }
        }

        // Log entity names
        if (recognizerResult.entities) {
            properties[LuisTelemetryConstants.entitiesProperty] = JSON.stringify(recognizerResult.entities);
        }

        // Use the LogPersonalInformation flag to toggle logging PII data, text is a common example
        if (this.logPersonalInformation && turnContext.activity.text) {
            properties[LuisTelemetryConstants.questionProperty] = turnContext.activity.text;
        }

        // Additional Properties can override "stock" properties.
        if (telemetryProperties != null) {
            return Object.assign({}, properties, telemetryProperties);
        }

        return properties;
    }

    private prepareErrorMessage(error: Error): void {
        // If the `error` received is a azure-cognitiveservices-luis-runtime error,
        // it may have a `response` property and `response.statusCode`.
        // If these properties exist, we should populate the error with a correct and informative error message.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: Record<'status', number> = (error as any).response;

        if (response?.status) {
            switch (response.status) {
                case 400:
                    error.message = [
                        "Response 400: The request's body or parameters are incorrect,",
                        'meaning they are missing, malformed, or too large.',
                    ].join(' ');
                    break;
                case 401:
                    error.message =
                        "Response 401: The key used is invalid, malformed, empty, or doesn't match the region.";
                    break;
                case 403:
                    error.message = 'Response 403: Total monthly key quota limit exceeded.';
                    break;
                case 409:
                    error.message = 'Response 409: Application loading in progress, please try again.';
                    break;
                case 410:
                    error.message = 'Response 410: Please retrain and republish your application.';
                    break;
                case 414:
                    error.message =
                        'Response 414: The query is too long. Please reduce the query length to 500 or less characters.';
                    break;
                case 429:
                    error.message = 'Response 429: Too many requests.';
                    break;
                default:
                    error.message = [
                        `Response ${response.status}: Unexpected status code received.`,
                        'Please verify that your LUIS application is properly setup.',
                    ].join(' ');
            }
        }
    }

    // Merges the default options set by the Recognizer contructor with the 'user' options passed into the 'recognize' method
    private setLuisPredictionOptions(
        defaultOptions: LuisPredictionOptions,
        userOptions: LuisPredictionOptions
    ): LuisPredictionOptions {
        return Object.assign(defaultOptions, userOptions);
    }
    // Performs a series of valdiations on `LuisRecognizer.application`.
    // Note: Neither the LUIS Application ID nor the Endpoint Key are actual LUIS components, they are representations of what two valid values would appear as.
    private validateLuisApplication(): void {
        if (!this.application.applicationId) {
            throw new Error(
                `Invalid \`applicationId\` value detected: ${this.application.applicationId}\nPlease make sure your applicationId is a valid LUIS Application Id, e.g. "b31aeaf3-3511-495b-a07f-571fc873214b".`
            );
        }
        if (!this.application.endpointKey) {
            throw new Error(
                `Invalid \`endpointKey\` value detected: ${this.application.endpointKey}\nPlease make sure your endpointKey is a valid LUIS Endpoint Key, e.g. "048ec46dc58e495482b0c447cfdbd291".`
            );
        }
    }

    // Builds a LuisRecognizer Strategy depending on the options passed
    private buildRecognizer(
        userOptions: LuisRecognizerOptionsV2 | LuisRecognizerOptionsV3 | LuisPredictionOptions
    ): LuisRecognizerV3 | LuisRecognizerV2 {
        if (isLuisRecognizerOptionsV3(userOptions)) {
            return new LuisRecognizerV3(this.application, userOptions);
        } else if (isLuisRecognizerOptionsV2(userOptions)) {
            return new LuisRecognizerV2(this.application, userOptions);
        } else {
            if (!this.options) {
                this.options = {};
            }
            const merge = Object.assign(this.options, userOptions);

            const recOptions: LuisRecognizerOptionsV2 = {
                ...merge,
                apiVersion: 'v2',
            };

            return new LuisRecognizerV2(this.application, recOptions);
        }
    }
}
