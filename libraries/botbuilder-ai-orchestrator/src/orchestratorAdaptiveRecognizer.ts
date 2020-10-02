/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { existsSync } from 'fs';
import { resolve } from 'path';
import { TextEncoder } from 'util';

import { BoolExpression, NumberExpression, StringExpression } from 'adaptive-expressions';
import { Activity, Entity, RecognizerResult } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { createRecognizerResult, EntityRecognizer, EntityRecognizerSet, Recognizer, TextEntity } from 'botbuilder-dialogs-adaptive';

const oc: any = require('orchestrator-core/orchestrator-core.node');
const ReadText: any = require('read-text-file');

/**
 * Class that represents an adaptive Orchestrator recognizer.
 */
export class OrchestratorAdaptiveRecognizer extends Recognizer {
    /**
     * Recognizers unique ID.
     */
    public id: string;

    /**
     * Path to the model to load.
     */
    public modelPath: StringExpression = new StringExpression('');

    /**
     * Path to the snapshot (.blu file) to load.
     */
    public snapshotPath: StringExpression = new StringExpression('');

    /**
     * Threshold value to use for ambiguous intent detection.
     * Any intents that are classified with a score that is within this value from the top scoring intent is determined to be ambiguous.
     */
    public disambiguationScoreThreshold: NumberExpression = new NumberExpression(0.05);

    /**
     * Enable ambiguous intent detection.
     */
    public detectAmbiguousIntents: BoolExpression = new BoolExpression(false);

    /**
     * The entity recognizers.
     */
    public entityRecognizers: EntityRecognizer[] = [];

    /**
     * Intent name if ambiguous intents are detected.
     */
    public readonly chooseIntent: string = 'ChooseIntent';

    /**
     * Property under which ambiguous intents are returned.
     */
    public readonly candidatesCollection: string = 'candidates';

    /**
     * Intent name when no intent matches.
     */
    public readonly noneIntent: string = 'None';

    /**
     * Full recognition results are available under this property
     */
    public readonly resultProperty: string = 'result';

    private readonly unknownIntentFilterScore = 0.4;
    private static orchestrator: any = null;
    private resolver: any = null;
    private _modelPath: string = null;
    private _snapshotPath: string = null;

    /**
     * Returns an OrchestratorAdaptiveRecognizer instance.
     * @param modelPath Path to NLR model.
     * @param snapshoPath Path to snapshot.
     * @param resolver Orchestrator resolver to use.
     */
    constructor(modelPath?: string, snapshoPath?: string, resolver?: any)
    {
        super()
        this._modelPath = modelPath !== undefined ? modelPath : null;
        this._snapshotPath = snapshoPath !== undefined ? snapshoPath : null;
        this.resolver = resolver !== undefined ? resolver : null;
    }

    /**
     * Returns a new OrchestratorAdaptiveRecognizer instance.
     * @param dialogContext Context for the current dialog.
     * @param activity Current activity sent from user.
     */
    public async recognize(dialogContext: DialogContext, activity: Activity): Promise<RecognizerResult> {
        if (this.modelPath === null) {
            throw new Error(`Missing "ModelPath" information.`);
        }

        if (this.snapshotPath === null) {
            throw new Error(`Missing "SnapshotPath" information.`);
        }

        const text = activity.text || '';
        this._modelPath = this.modelPath.getValue(dialogContext.state);
        this._snapshotPath = this.snapshotPath.getValue(dialogContext.state);
        const detectAmbiguity = this.detectAmbiguousIntents.getValue(dialogContext.state);
        const disambiguationScoreThreshold = this.disambiguationScoreThreshold.getValue(dialogContext.state);

        const recognizerResult: RecognizerResult = createRecognizerResult(text, {}, {});

        if (text === '') {
            return recognizerResult;
        }

        if (OrchestratorAdaptiveRecognizer.orchestrator === null || this.resolver === null) {
            this.Initialize();
        }

        // recognize text
        let result = await this.resolver.score(text);

        if (Object.entries(result).length !== 0) {
            this.AddTopScoringIntent(result, recognizerResult);
        }

        // run entity recognizers
        await this.recognizeEntities(dialogContext, text, activity.locale || '', recognizerResult);

        // Add full recognition result as a 'result' property
        recognizerResult[this.resultProperty] = result;

        // disambiguate
        if (detectAmbiguity) {
            const topScoringIntent = result[0].score;
            const scoreDelta = topScoringIntent - disambiguationScoreThreshold;
            const ambiguousIntents = result.filter(x => x.score >= scoreDelta);
            if (ambiguousIntents.length > 1) {
                recognizerResult.intents = {};
                recognizerResult.intents[this.chooseIntent] = { score: 1.0 };
                recognizerResult[this.candidatesCollection] = [];
                ambiguousIntents.forEach(item => {
                    let itemRecoResult = {
                        text: text,
                        intents: {},
                        entities: {},
                        score: item.score
                    };
                    itemRecoResult.intents[item.label.name] = {
                        score: item.score
                    };
                    itemRecoResult.entities = recognizerResult.entities;
                    recognizerResult[this.candidatesCollection].push({
                        intent: item.label.name,
                        score: item.score,
                        closestText: item.closest_text,
                        result: itemRecoResult
                    });
                })
            }
        }

        if (Object.entries(recognizerResult.intents).length == 0) {
            recognizerResult.intents[this.noneIntent] = { score: 1.0 };
        }

        await dialogContext.context.sendTraceActivity('OrchestratorRecognizer', recognizerResult, 'RecognizerResult', 'Orchestrator recognizer RecognizerResult');

        return recognizerResult;
    }

    /**
     * @private
     */
    private AddTopScoringIntent(result: any, recognizerResult: RecognizerResult): void {
        const topScoringIntent = result[0].label.name;
        const topScore = result[0].score;

        // if top scoring intent is less than threshold, return None
        if (topScore < this.unknownIntentFilterScore) {
            recognizerResult.intents['None'] = { score: 1.0 };
        } else if (!recognizerResult.intents[topScoringIntent]) {
            recognizerResult.intents[topScoringIntent] = {
                score: topScore
            };
        }
    }

    /**
     * @private
     */
    private async recognizeEntities(dialogContext: DialogContext, text: string, locale: string, recognizerResult: RecognizerResult) {
        const entityPool: Entity[] = [];
        const textEntity = new TextEntity(text);
        textEntity['start'] = 0;
        textEntity['end'] = text.length;
        textEntity['score'] = 1.0;

        entityPool.push(textEntity);
        if (this.entityRecognizers) {
            const entitySet = new EntityRecognizerSet();
            entitySet.push(...this.entityRecognizers);
            const newEntities = await entitySet.recognizeEntities(dialogContext, text, locale, entityPool);
            if (newEntities.length > 0) {
                entityPool.push(...newEntities);
            }
        }

        for (let i = 0; i < entityPool.length; i++) {
            const entityResult = entityPool[i];
            let values = [];
            if (!recognizerResult.entities.hasOwnProperty(entityResult.type)) {
                recognizerResult.entities[entityResult.type] = values;
            } else {
                values = recognizerResult.entities[entityResult.type];
            }
            values.push(entityResult['text']);

            let instanceRoot = {};
            if (!recognizerResult.entities.hasOwnProperty('$instance')) {
                recognizerResult.entities['$instance'] = instanceRoot;
            } else {
                instanceRoot = recognizerResult.entities['$instance'];
            }

            let instanceData = [];
            if (!instanceRoot.hasOwnProperty(entityResult.type)) {
                instanceRoot[entityResult.type] = instanceData;
            } else {
                instanceData = instanceRoot[entityResult.type];
            }

            const instance = {
                startIndex: entityResult['start'],
                endIndex: entityResult['end'],
                score: 1.0,
                text: entityResult['text'],
                type: entityResult['type'],
                resolution: entityResult['resolution']
            };
            instanceData.push(instance);
        }
    }

    /**
     * @private
     */
    private Initialize() {
        if (OrchestratorAdaptiveRecognizer.orchestrator == null && this.resolver == null)
        {
            if (this._modelPath == null) {
                throw new Error(`Missing "ModelPath" information.`);
            }

            if (this._snapshotPath == null) {
                throw new Error(`Missing "ShapshotPath" information.`);
            }
            const fullModelPath = resolve(this._modelPath);
            const fullSnapshotPath = resolve(this._snapshotPath);
            if (!existsSync(fullModelPath)) {
                throw new Error(`Model folder does not exist at ${fullModelPath}.`);
            }
            if (!existsSync(fullSnapshotPath)) {
                throw new Error(`Snapshot file does not exist at ${fullSnapshotPath}.`);
            }

            if (OrchestratorAdaptiveRecognizer.orchestrator == null) {
                console.time("Model load");
                // Create orchestrator core
                OrchestratorAdaptiveRecognizer.orchestrator = new oc.Orchestrator();
                if (OrchestratorAdaptiveRecognizer.orchestrator.load(fullModelPath) === false) {
                    throw new Error(`Model load failed.`);
                }
                console.timeEnd("Model load");
            }

            if (this.resolver == null) {
                // Load the snapshot
                const encoder: any = new TextEncoder();
                const fileContent: string = ReadText.readSync(fullSnapshotPath)
                const snapshot: Uint8Array = encoder.encode(fileContent);

                // Load snapshot and create resolver
                this.resolver = OrchestratorAdaptiveRecognizer.orchestrator.createLabelResolver(snapshot);
            }
        }
    }
};
