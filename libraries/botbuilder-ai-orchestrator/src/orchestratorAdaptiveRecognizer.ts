/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { OrchestratorRecognizer } from './orchestratorRecognizer';
import { exception } from 'console';
import { StringExpression, BoolExpression, NumberExpression } from 'adaptive-expressions';
import { Entity, Activity, RecognizerResult } from 'botbuilder-core';
import { DialogContext, Configurable } from 'botbuilder-dialogs';
import { EntityRecognizer, TextEntity, EntityRecognizerSet, Recognizer } from 'botbuilder-dialogs-adaptive';

export class OrchestratorAdaptiveRecognizer extends Configurable implements Recognizer{
    /**
     * Recognizers unique ID.
     */
    public id: string;

    /**
     * Path to the model to load.
     */
    public modelPath: StringExpression = new StringExpression("");

    /**
     * Path to the snapshot (.blu file) to load.
     */
    public snapshotPath: StringExpression = new StringExpression("");

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
     * Intent name to use if detectAmbiguousIntent is true
     */
    public chooseIntent: string = 'ChooseIntent';

    private recognizer : OrchestratorRecognizer = null;
    private _candidatesCollection: string = 'candidates';
    private _noneIntent: string = 'None';

    /**
     * Returns a new OrchestratorAdaptiveRecognizer instance.
     * @param dialogContext Context for the current dialog.
     * @param activity Current activity sent from user.
     */
    public async recognize(dialogContext: DialogContext, activity: Activity): Promise<RecognizerResult> {
        if (this.modelPath === null) {
            throw new exception(`Missing "ModelPath" information.`);
        }

        if (this.snapshotPath === null) {
            throw new exception(`Missing "SnapshotPath" information.`);
        }
        const text = activity.text || '';
        const modelPath = this.modelPath.getValue(dialogContext.state);
        const snapShotPath = this.snapshotPath.getValue(dialogContext.state);
        const detectAmbiguity = this.detectAmbiguousIntents.getValue(dialogContext.state);
        const disambiguationScoreThreshold = this.disambiguationScoreThreshold.getValue(dialogContext.state);

        let recognizerResult : RecognizerResult;

        if (text === '') {
            return {
                text: text,
                intents: {},
                entities: {}
            }
        } 

        if (this.recognizer === null) {
            this.recognizer = new OrchestratorRecognizer(modelPath, snapShotPath);
        }   

        // recognize text
        recognizerResult = await this.recognizer.recongizeTextAsync(text);

        // run entity recognizers
        await this.recognizeEntities(dialogContext, text, activity.locale || '', recognizerResult);

        // disambiguate
        if (detectAmbiguity)
        {
            const recoResults = recognizerResult[this.recognizer.resultProperty];
            const topScoringIntent = recoResults[0].score;
            const scoreDelta = topScoringIntent - disambiguationScoreThreshold;
            const ambiguousIntents = recoResults.filter(x => x.score >= scoreDelta);
            if (ambiguousIntents.length > 1) {
                recognizerResult.intents = {};
                recognizerResult.intents[this.chooseIntent] = { score: 1.0 };
                recognizerResult[this.chooseIntent] = [];
                ambiguousIntents.forEach(item => {
                    let itemRecoResult = {
                        text: text,
                        intents: {},
                        entities: {},
                        score : item.score
                    };
                    itemRecoResult.intents[item.label] = {
                        score: item.score
                    };
                    itemRecoResult.entities = recognizerResult.entities;
                    recognizerResult[this.chooseIntent].push({
                        intent : item.label.name,
                        score : item.score,
                        closestText: item.closest_text,
                        result: itemRecoResult
                    });
                })
            }
        }

        if (Object.entries(recognizerResult.intents).length == 0) {
            recognizerResult.intents[this._noneIntent] = { score: 1.0 };
        }

        return recognizerResult;
    }

    private async recognizeEntities(dialogContext : DialogContext, text : string, locale : string, recognizerResult : RecognizerResult) {
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
};
