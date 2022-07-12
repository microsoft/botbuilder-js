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
const oc = require('@microsoft/orchestrator-core');

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

interface OrchestratorDictionaryEntry {
    orchestrator: Orchestrator;
    isEntityExtractionCapable: boolean;
}

/**
 * Class that represents an adaptive Orchestrator recognizer.
 */
export class OrchestratorRecognizer extends AdaptiveRecognizer implements OrchestratorRecognizerConfiguration {
    static $kind = 'Microsoft.OrchestratorRecognizer';

    /**
     * Path to Orchestrator base model folder.
     */
    modelFolder: StringExpression = new StringExpression('=settings.orchestrator.modelFolder');

    /**
     * Path to the snapshot (.blu file) to load.
     */
    snapshotFile: StringExpression = new StringExpression('=settings.orchestrator.snapshotFile');

    /**
     * Threshold value to use for ambiguous intent detection. Defaults to 0.05.
     * Recognizer returns ChooseIntent (disambiguation) if other intents are classified within this threshold of the top scoring intent.
     */
    disambiguationScoreThreshold: NumberExpression = new NumberExpression(0.05);

    /**
     * Enable ambiguous intent detection. Defaults to false.
     */
    detectAmbiguousIntents: BoolExpression = new BoolExpression(false);

    /**
     * The external entity recognizer.
     */
    externalEntityRecognizer?: Recognizer = undefined;

    /**
     * Enable entity detection if entity model exists inside modelFolder. Defaults to true.
     * NOTE: SHOULD consider removing this flag in the next major SDK release (V5).
     */
    scoreEntities = true;

    /**
     * Intent name if ambiguous intents are detected.
     */
    readonly chooseIntent = 'ChooseIntent';

    /**
     * Full intent recognition results are available under this property
     */
    readonly resultProperty = 'result';

    /**
     * Full entity recognition results are available under this property
     */
    readonly entityProperty = 'entityResult';

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof OrchestratorRecognizerConfiguration): Converter | ConverterFactory {
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
    private static orchestratorMap = new Map<string, OrchestratorDictionaryEntry>();
    private _orchestrator?: OrchestratorDictionaryEntry = undefined;
    private _resolver?: LabelResolver = undefined;
    private _isResolverExternal = false;

    /**
     * Returns an OrchestratorRecognizer instance.
     *
     * @param {string} modelFolder Path to NLR model.
     * @param {string} snapshotFile Path to snapshot.
     * @param {any} resolverExternal Orchestrator resolver to use.
     */
    constructor(modelFolder?: string, snapshotFile?: string, resolverExternal?: LabelResolver) {
        super();

        if ((modelFolder && snapshotFile) || resolverExternal) {
            this._initializeModel(modelFolder, snapshotFile, resolverExternal);
        }
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
    async recognize(
        dc: DialogContext,
        activity: Partial<Activity>,
        telemetryProperties?: Record<string, string>,
        telemetryMetrics?: Record<string, number>
    ): Promise<RecognizerResult> {
        if (!this._resolver) {
            const modelFolder: string = this.modelFolder.getValue(dc.state);
            const snapshotFile: string = this.snapshotFile.getValue(dc.state);
            this._initializeModel(modelFolder, snapshotFile, undefined);
        }

        const text = activity.text ?? '';
        const detectAmbiguity = this.detectAmbiguousIntents.getValue(dc.state);

        let recognizerResult: RecognizerResult = {
            text,
            intents: {},
            entities: {},
        };

        if (!text) {
            // nothing to recognize, return empty result.
            return recognizerResult;
        }

        // Score with orchestrator
        const results = await this._resolver?.score(text);

        if (results?.length) {
            // Add full recognition result as a 'result' property
            recognizerResult[this.resultProperty] = results;

            const topScore = results[0].score;

            // if top scoring intent is less than threshold, return None
            if (topScore < this.unknownIntentFilterScore) {
                // add all scores
                recognizerResult.intents = results.reduce(function (
                    intents: { [index: string]: { score: number } },
                    result
                ) {
                    intents[result.label.name] = { score: result.score };
                    return intents;
                },
                {});
                recognizerResult.intents.None = { score: 1.0 };
            } else {
                // add all scores
                recognizerResult.intents = results.reduce(function (
                    intents: { [index: string]: { score: number } },
                    result
                ) {
                    intents[result.label.name] = { score: result.score };
                    return intents;
                },
                {});

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

        await this.tryScoreEntitiesAsync(text, recognizerResult);

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
                let score = 0;
                if (intent[1].score) {
                    score = intent[1].score;
                }
                return { name: intent[0], score: +score };
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
        telemetryProperties?: Record<string, string>,
        dialogContext?: DialogContext
    ): Record<string, string> {
        const topTwo = this.getTopTwoIntents(recognizerResult);
        const intent = Object.entries(recognizerResult.intents);
        // customRecognizerProps = recognizerResult with following properties omitted:
        //   text, alteredText, intents, entities
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        const { text, alteredText, intents, entities, ...customRecognizerProps } = recognizerResult;
        const properties: Record<string, string> = {
            TopIntent: intent.length > 0 ? topTwo[0].name : '',
            TopIntentScore: intent.length > 0 ? topTwo[0].score.toString() : '',
            NextIntent: intent.length > 1 ? topTwo[1].name : '',
            NextIntentScore: intent.length > 1 ? topTwo[1].score.toString() : '',
            Intents: intent.length > 0 ? JSON.stringify(recognizerResult.intents) : '',
            Entities: recognizerResult.entities ? JSON.stringify(recognizerResult.entities) : '',
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

    private _initializeModel(modelFolder?: string, snapshotFile?: string, resolverExternal?: LabelResolver): void {
        if (this._resolver) {
            return;
        }
        if (resolverExternal) {
            this._resolver = resolverExternal;
            this._isResolverExternal = true;
            return;
        }

        if (!modelFolder) {
            throw new Error('Missing "ModelFolder" information.');
        }

        if (!snapshotFile) {
            throw new Error('Missing "ShapshotFile" information.');
        }

        // Create orchestrator core
        const fullModelFolder: string = resolve(modelFolder);

        this._orchestrator = OrchestratorRecognizer.orchestratorMap.has(fullModelFolder)
            ? OrchestratorRecognizer.orchestratorMap.get(fullModelFolder)
            : ((): OrchestratorDictionaryEntry => {
                  if (!existsSync(fullModelFolder)) {
                      throw new Error(`Model folder does not exist at ${fullModelFolder}.`);
                  }
                  const entityModelFolder: string = resolve(modelFolder, 'entity');
                  const isEntityExtractionCapable: boolean = existsSync(entityModelFolder);
                  const orchestrator = new oc.Orchestrator();
                  if (isEntityExtractionCapable) {
                      if (!orchestrator.load(fullModelFolder, entityModelFolder)) {
                          throw new Error(
                              `Model load failed - model folder ${fullModelFolder}, entity model folder ${entityModelFolder}.`
                          );
                      }
                  } else {
                      if (!orchestrator.load(fullModelFolder)) {
                          throw new Error(`Model load failed - model folder ${fullModelFolder}.`);
                      }
                  }
                  const orchestratorDictionaryEntry: OrchestratorDictionaryEntry = {
                      orchestrator,
                      isEntityExtractionCapable,
                  };
                  OrchestratorRecognizer.orchestratorMap.set(fullModelFolder, orchestratorDictionaryEntry);
                  return orchestratorDictionaryEntry;
              })();

        const fullSnapshotPath = resolve(snapshotFile);
        if (!existsSync(fullSnapshotPath)) {
            throw new Error(`Snapshot file does not exist at ${fullSnapshotPath}.`);
        }

        // Load the snapshot
        const snapshot: Uint8Array = readFileSync(fullSnapshotPath);

        // Load snapshot and create resolver
        this._resolver = this._orchestrator?.orchestrator.createLabelResolver(snapshot);
    }

    private async tryScoreEntitiesAsync(text: string, recognizerResult: RecognizerResult) {
        // It's impossible to extract entities without a _resolver object.
        if (!this._resolver) {
            return;
        }

        // Entity extraction can be controlled by the ScoreEntities flag.
        // NOTE: SHOULD consider removing this flag in the next major SDK release (V5).
        if (!this.scoreEntities) {
            return;
        }

        // The following check is necessary to ensure that the _resolver object
        // is capable of entity extraction. However, this check does not apply to
        // an external, mock-up _resolver.
        if (!this._isResolverExternal) {
            if (!this._orchestrator || !this._orchestrator.isEntityExtractionCapable) {
                return;
            }
        }

        // As this method is TryScoreEntities, so it's best effort only, there should
        // not be any exception thrown out of this method.
        try {
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
        } catch {
            return;
        }
    }
}
