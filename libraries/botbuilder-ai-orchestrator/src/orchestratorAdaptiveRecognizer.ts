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

export interface OrchestratorAdaptiveRecognizerConfiguration extends RecognizerConfiguration {
    modelFolder?: string | Expression | StringExpression;
    snapshotFile?: string | Expression | StringExpression;
    disambiguationScoreThreshold?: number | string | Expression | NumberExpression;
    detectAmbiguousIntents?: boolean | string | Expression | BoolExpression;
    externalEntityRecognizer?: Recognizer;
}

type LabelResolver = {
    score(
        text: string
    ): {
        score: number;
        closest_text: string;
        label: {
            name: string;
        };
    }[];
};

type Orchestrator = {
    createLabelResolver(snapshot: Uint8Array): LabelResolver;
};

/**
 * Class that represents an adaptive Orchestrator recognizer.
 */
export class OrchestratorAdaptiveRecognizer
    extends AdaptiveRecognizer
    implements OrchestratorAdaptiveRecognizerConfiguration {
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
     * Intent name if ambiguous intents are detected.
     */
    public readonly chooseIntent: string = 'ChooseIntent';

    /**
     * Full recognition results are available under this property
     */
    public readonly resultProperty: string = 'result';

    public getConverter(property: keyof OrchestratorAdaptiveRecognizerConfiguration): Converter | ConverterFactory {
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
     * Returns an OrchestratorAdaptiveRecognizer instance.
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
     * Returns a new OrchestratorAdaptiveRecognizer instance.
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
            const topScoringIntent = results[0].label.name;
            const topScore = results[0].score;

            // if top scoring intent is less than threshold, return None
            if (topScore < this.unknownIntentFilterScore) {
                recognizerResult.intents.None = { score: 1.0 };
            } else {
                // add top score
                recognizerResult.intents[`${topScoringIntent}`] ??= {
                    score: topScore,
                };

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

        await dc.context.sendTraceActivity(
            'OrchestratorAdaptiveRecognizer',
            recognizerResult,
            'OrchestratorAdaptiveRecognizer',
            'Orchestrator Recognition'
        );
        this.trackRecognizerResult(
            dc,
            'OrchestratorAdaptiveRecognizerResult',
            this.fillRecognizerResultTelemetryProperties(recognizerResult, telemetryProperties, dc),
            telemetryMetrics
        );

        return recognizerResult;
    }

    private _initializeModel() {
        if (!this._modelFolder) {
            throw new Error(`Missing "ModelFolder" information.`);
        }

        if (!this._snapshotFile) {
            throw new Error(`Missing "ShapshotFile" information.`);
        }

        if (!OrchestratorAdaptiveRecognizer.orchestrator && !this._resolver) {
            // Create orchestrator core
            const fullModelFolder = resolve(this._modelFolder);
            if (!existsSync(fullModelFolder)) {
                throw new Error(`Model folder does not exist at ${fullModelFolder}.`);
            }
            const orchestrator = new oc.Orchestrator();
            if (!orchestrator.load(fullModelFolder)) {
                throw new Error(`Model load failed.`);
            }
            OrchestratorAdaptiveRecognizer.orchestrator = orchestrator;
        }

        if (!this._resolver) {
            const fullSnapshotPath = resolve(this._snapshotFile);
            if (!existsSync(fullSnapshotPath)) {
                throw new Error(`Snapshot file does not exist at ${fullSnapshotPath}.`);
            }
            // Load the snapshot
            const snapshot: Uint8Array = readFileSync(fullSnapshotPath);

            // Load snapshot and create resolver
            this._resolver = OrchestratorAdaptiveRecognizer.orchestrator.createLabelResolver(snapshot);
        }
    }
}
