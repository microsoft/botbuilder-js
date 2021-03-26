/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';

import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    NumberExpression,
    NumberExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

import { AdaptiveRecognizer } from 'botbuilder-dialogs-adaptive';
import { Activity, RecognizerResult } from 'botbuilder-core';
import { Converter, ConverterFactory, DialogContext, Recognizer, RecognizerConfiguration } from 'botbuilder-dialogs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const oc = require('orchestrator-core');

export interface OrchestratorRecognizerConfiguration extends RecognizerConfiguration {
    modelFolder?: string | Expression | StringExpression;
    snapshotFile?: string | Expression | StringExpression;
    disambiguationScoreThreshold?: number | string | Expression | NumberExpression;
    detectAmbiguousIntents?: boolean | string | Expression | BoolExpression;
    externalEntityRecognizer?: Recognizer;
}

export enum LabelType {
    Intent = 1,
    Entity = 2,
}

interface Label {
    name: string;
    span: {
        offset: number;
        length: number;
    };
}

interface Result {
    score: number;
    closest_text: string;
    label: Label;
}

interface LabelResolver {
    score(text: string, labelType?: number): Result[];
}

interface Orchestrator {
    createLabelResolver(snapshot: Uint8Array): LabelResolver;
}

/**
 * Class that represents an adaptive Orchestrator recognizer.
 */
export class OrchestratorRecognizer extends AdaptiveRecognizer implements OrchestratorRecognizerConfiguration {
    public static $kind = 'Microsoft.OrchestratorRecognizer';

    /**
     * Path to Orchestrator base model folder.
     */
    public modelFolder: StringExpression = new StringExpression('=settings.orchestrator.modelFolder');

    /**
     * Path to the snapshot (.blu file) to load.
     */
    public snapshotFile: StringExpression = new StringExpression('=settings.orchestrator.snapshotFile');

    /**
     * Threshold value to use for ambiguous intent detection. Defaults to 0.05.
     * Recognizer returns ChooseIntent (disambiguation) if other intents are classified within this threshold of the top scoring intent.
     */
    public disambiguationScoreThreshold: NumberExpression = new NumberExpression(0.05);

    /**
     * Enable ambiguous intent detection. Defaults to false.
     */
    public detectAmbiguousIntents: BoolExpression = new BoolExpression(false);

    /**
     * The external entity recognizer.
     */
    public externalEntityRecognizer: Recognizer;

    /**
     * Enable entity detection if entity model exists inside modelFolder. Defaults to false.
     */
    public scoreEntities = false;

    /**
     * Intent name if ambiguous intents are detected.
     */
    public readonly chooseIntent = 'ChooseIntent';

    /**
     * Full intent recognition results are available under this property
     */
    public readonly resultProperty = 'result';

    /**
     * Full entity recognition results are available under this property
     */
    public readonly entityProperty = 'entityResult';

    public getConverter(property: keyof OrchestratorRecognizerConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'modelFolder':
                return new StringExpressionConverter();
            case 'snapshotFile':
                return new StringExpressionConverter();
            case 'disambiguationScoreThreshold':
                return new NumberExpressionConverter();
            case 'detectAmbiguousIntents':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    private readonly unknownIntentFilterScore = 0.4;
    private static orchestrator: Orchestrator;
    private _resolver: LabelResolver;
    private _modelFolder: string;
    private _snapshotFile: string;

    /**
     * Returns an OrchestratorRecognizer instance.
     *
     * @param {string} modelFolder Path to NLR model.
     * @param {string} snapshotFile Path to snapshot.
     * @param {any} resolver Orchestrator resolver to use.
     */
    public constructor(modelFolder?: string, snapshotFile?: string, resolver?: LabelResolver) {
        super();
        if (modelFolder) {
            this._modelFolder = modelFolder;
        }
        if (snapshotFile) {
            this._snapshotFile = snapshotFile;
        }
        this._resolver = resolver;
    }

    /**
     * Returns a new OrchestratorRecognizer instance.
     *
     * @param {DialogContext} dc Context for the current dialog.
     * @param {Partial<Activity>} activity Current activity sent from user.
     * @param {Record<string, string>} telemetryProperties Additional properties to be logged to telemetry with event.
     * @param {Record<string, number>} telemetryMetrics Additional metrics to be logged to telemetry with event.
     * @returns {Promise<RecognizerResult>} Recognized result.
     */
    public async recognize(
        dc: DialogContext,
        activity: Partial<Activity>,
        telemetryProperties?: Record<string, string>,
        telemetryMetrics?: Record<string, number>
    ): Promise<RecognizerResult> {
        if (!this.modelFolder) {
            throw new Error(`Missing "ModelFolder" information.`);
        }

        if (!this.snapshotFile) {
            throw new Error(`Missing "SnapshotFile" information.`);
        }

        const text = activity.text ?? '';
        this._modelFolder = this.modelFolder.getValue(dc.state);
        this._snapshotFile = this.snapshotFile.getValue(dc.state);
        const detectAmbiguity = this.detectAmbiguousIntents.getValue(dc.state);

        let recognizerResult: RecognizerResult = {
            text,
            intents: {},
            entities: {},
        };

        if (text === '') {
            // nothing to recognize, return empty result.
            return recognizerResult;
        }

        this._initializeModel();

        if (this.externalEntityRecognizer) {
            // Run external recognition
            const externalResults = await this.externalEntityRecognizer.recognize(
                dc,
                activity,
                telemetryProperties,
                telemetryMetrics
            );
            recognizerResult.entities = externalResults.entities;
        }

        // Score with orchestrator
        const results = await this._resolver.score(text);

        // Add full recognition result as a 'result' property
        recognizerResult[this.resultProperty] = results;

        if (results.length) {
            const topScore = results[0].score;

            // if top scoring intent is less than threshold, return None
            if (topScore < this.unknownIntentFilterScore) {
                recognizerResult.intents.None = { score: 1.0 };
            } else {
                // add all scores
                recognizerResult.intents = results.reduce(function (intents, result) {
                    intents[result.label.name] = { score: result.score };
                    return intents;
                }, {});

                // disambiguate
                if (detectAmbiguity) {
                    const disambiguationScoreThreshold = this.disambiguationScoreThreshold.getValue(dc.state);
                    const classifyingScore = topScore - disambiguationScoreThreshold;
                    const ambiguousResults = results.filter(
                        (item: { score: number }) => item.score >= classifyingScore
                    );
                    if (ambiguousResults.length > 1) {
                        const recognizerResults: Record<string, RecognizerResult> = ambiguousResults
                            .map(
                                (result): RecognizerResult => ({
                                    text,
                                    alteredText: result.closest_text,
                                    entities: recognizerResult.entities,
                                    intents: { [result.label.name]: { score: result.score } },
                                })
                            )
                            .reduce((results: Record<string, RecognizerResult>, result: RecognizerResult) => {
                                const guid = uuidv4();
                                results[`${guid}`] = result;
                                return results;
                            }, {});

                        // replace RecognizerResult with ChooseIntent => Ambiguous recognizerResults as candidates.
                        recognizerResult = this.createChooseIntentResult(recognizerResults);
                    }
                }
            }
        } else {
            // Return 'None' if no intent matched.
            recognizerResult.intents.None = { score: 1.0 };
        }

        await this.tryScoreEntities(text, recognizerResult);

        await dc.context.sendTraceActivity(
            'OrchestratorRecognizer',
            recognizerResult,
            'OrchestratorRecognizer',
            'Orchestrator Recognition'
        );
        this.trackRecognizerResult(
            dc,
            'OrchestratorRecognizerResult',
            this.fillRecognizerResultTelemetryProperties(recognizerResult, telemetryProperties, dc),
            telemetryMetrics
        );

        return recognizerResult;
    }

    private getTopTwoIntents(result: RecognizerResult): { name: string; score: number }[] {
        if (!result || !result.intents) {
            throw new Error('result is empty');
        }
        const intents = Object.entries(result.intents)
            .map((intent) => {
                return { name: intent[0], score: +intent[1].score };
            })
            .sort((a, b) => b.score - a.score);
        intents.length = 2;

        return intents;
    }

    /**
     * Uses the RecognizerResult to create a list of properties to be included when tracking the result in telemetry.
     *
     * @param {RecognizerResult} recognizerResult Recognizer Result.
     * @param {Record<string, string>} telemetryProperties A list of properties to append or override the properties created using the RecognizerResult.
     * @param {DialogContext} dialogContext Dialog Context.
     * @returns {Record<string, string>} A collection of properties that can be included when calling the TrackEvent method on the TelemetryClient.
     */
    protected fillRecognizerResultTelemetryProperties(
        recognizerResult: RecognizerResult,
        telemetryProperties: Record<string, string>,
        dialogContext?: DialogContext
    ): Record<string, string> {
        const topTwo = this.getTopTwoIntents(recognizerResult);
        const intent = Object.entries(recognizerResult.intents);
        // customRecognizerProps = recognizerResult with following properties omitted:
        //   text, alteredText, intents, entities
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        const { text, alteredText, intents, entities, ...customRecognizerProps } = recognizerResult;
        const properties: Record<string, string> = {
            TopIntent: intent.length > 0 ? topTwo[0].name : undefined,
            TopIntentScore: intent.length > 0 ? topTwo[0].score.toString() : undefined,
            NextIntent: intent.length > 1 ? topTwo[1].name : undefined,
            NextIntentScore: intent.length > 1 ? topTwo[1].score.toString() : undefined,
            Intents: intent.length > 0 ? JSON.stringify(recognizerResult.intents) : undefined,
            Entities: recognizerResult.entities ? JSON.stringify(recognizerResult.entities) : undefined,
            AdditionalProperties: JSON.stringify(customRecognizerProps),
        };

        let logPersonalInformation =
            this.logPersonalInformation instanceof BoolExpression
                ? this.logPersonalInformation.getValue(dialogContext.state)
                : this.logPersonalInformation;
        if (logPersonalInformation == undefined) logPersonalInformation = false;

        if (logPersonalInformation) {
            properties['Text'] = recognizerResult.text;
            properties['AlteredText'] = recognizerResult.alteredText;
        }

        // Additional Properties can override "stock" properties.
        if (telemetryProperties) {
            return Object.assign({}, properties, telemetryProperties);
        }

        return properties;
    }

    private _initializeModel() {
        if (!this._modelFolder) {
            throw new Error(`Missing "ModelFolder" information.`);
        }

        if (!this._snapshotFile) {
            throw new Error(`Missing "ShapshotFile" information.`);
        }

        if (!OrchestratorRecognizer.orchestrator && !this._resolver) {
            // Create orchestrator core
            const fullModelFolder = resolve(this._modelFolder);
            if (!existsSync(fullModelFolder)) {
                throw new Error(`Model folder does not exist at ${fullModelFolder}.`);
            }

            const entityModelFolder = resolve(this._modelFolder, 'entity');
            this.scoreEntities = existsSync(entityModelFolder);

            const orchestrator = new oc.Orchestrator();
            if (this.scoreEntities && !orchestrator.load(fullModelFolder, entityModelFolder)) {
                throw new Error(`Model load failed.`);
            } else if (!orchestrator.load(fullModelFolder)) {
                throw new Error(`Model load failed.`);
            }
            OrchestratorRecognizer.orchestrator = orchestrator;
        }

        if (!this._resolver) {
            const fullSnapshotPath = resolve(this._snapshotFile);
            if (!existsSync(fullSnapshotPath)) {
                throw new Error(`Snapshot file does not exist at ${fullSnapshotPath}.`);
            }
            // Load the snapshot
            const snapshot: Uint8Array = readFileSync(fullSnapshotPath);

            // Load snapshot and create resolver
            this._resolver = OrchestratorRecognizer.orchestrator.createLabelResolver(snapshot);
        }
    }

    private async tryScoreEntities(text: string, recognizerResult: RecognizerResult) {
        if (!this.scoreEntities) {
            return;
        }

        const results = await this._resolver.score(text, LabelType.Entity);
        if (!results) {
            throw new Error(`Failed scoring entities for: ${text}`);
        }

        // Add full entity recognition result as a 'entityResult' property
        recognizerResult[this.entityProperty] = results;
        if (results.length) {
            recognizerResult.entities ??= {};

            results.forEach((result: Result) => {
                const entityType = result.label.name;

                // add value
                const values = recognizerResult.entities[entityType] ?? [];
                recognizerResult.entities[entityType] = values;

                const span = result.label.span;
                const entityText = text.substr(span.offset, span.length);
                values.push({
                    type: entityType,
                    score: result.score,
                    text: entityText,
                    start: span.offset,
                    end: span.offset + span.length,
                });

                // get/create $instance
                recognizerResult.entities['$instance'] ??= {};
                const instanceRoot = recognizerResult.entities['$instance'];

                // add instanceData
                instanceRoot[entityType] ??= [];
                const instanceData = instanceRoot[entityType];
                instanceData.push({
                    startIndex: span.offset,
                    endIndex: span.offset + span.length,
                    score: result.score,
                    text: entityText,
                    type: entityType,
                });
            });
        }
    }
}
