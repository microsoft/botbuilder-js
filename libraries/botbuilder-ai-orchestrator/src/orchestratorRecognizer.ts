/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, RecognizerResult } from 'botbuilder-core';
import { StringExpression, BoolExpression } from 'adaptive-expressions';
import { EntityRecognizer, TextEntity, EntityRecognizerSet, Recognizer } from 'botbuilder-dialogs-adaptive';
import { Configurable, DialogContext } from 'botbuilder-dialogs';
import { exception } from 'console';
import path from 'path';

const oc = require('oc_node_authoring/oc_node_authoring.node');
const ReadText: any = require('read-text-file');

export class OrchestratorRecognizer extends Configurable implements Recognizer {
    public id: string;
    public modelPath: StringExpression;
    public snapshotPath: StringExpression;
    public useCompactEmbeddings: BoolExpression;
    public disambiguationScoreThreshold: number;
    public detectAmbiguousIntents: BoolExpression;
    /**
     * The entity recognizers.
     */
    public entityRecognizers: EntityRecognizer[] = [];
    /**
     * Intent name to use if detectAmbiguousIntent is true
     */
    public chooseIntent: string = "";
    private _candidatesCollection: string = "candidates";
    private _noneIntent: string = "None";
    private static _orchestrator: any = null;
    private static _modelPath: string = null;
    private _resolver: any = null;
    private _modelPath: string = null;
    private _snapShotPath: string = null;
    private _useCompactEmbeddings: boolean = true;

    public async recognize(dialogContext: DialogContext, activity: Activity): Promise<RecognizerResult> 
    {
        var text = activity.text || '';
        var detectAmbiguity = this.detectAmbiguousIntents.getValue(dialogContext.state);
        var result: any = null;

        const recognizerResult: RecognizerResult = {
            text: text,
            intents: {},
            entities: {},
            properties: {}
        };

        if (text === '') return recognizerResult;

        this._modelPath = this.modelPath.getValue(dialogContext.state);
        this._snapShotPath = this.snapshotPath.getValue(dialogContext.state);
        this._useCompactEmbeddings = this.useCompactEmbeddings.getValue(dialogContext.state);

        await this.InitializeModel();

        if (this._resolver !== null) {
            // run entity recognizers

            result = this.Score(text);

            // disambiguate

            this.AddTopScoringIntent(result, recognizerResult);
        }

        if (Object.entries(recognizerResult.intents).length == 0) {
            recognizerResult.intents['None'] = { score: 1.0 };
        }

        await dialogContext.context.sendTraceActivity('OrchestratorRecognizer', recognizerResult, 'RecognizerResult', 'Orchestrator recognizer RecognizerResult');

        return recognizerResult;
    }
    
    public Score (text: string) : any {
        return this._resolver.score(text);
    }

    public static async createRecognizerAsync(modelPath: string, snapShotPath: string)
    {
        if (modelPath === null)
        {
            throw new exception(`Missing "ModelPath" information.`);
        }

        if (snapShotPath === null)
        {
            throw new exception(`Missing "SnapshotPath" information.`);
        }

        var recognizer = new OrchestratorRecognizer();

        OrchestratorRecognizer._modelPath = modelPath;

        recognizer._snapShotPath = snapShotPath;
        
        await recognizer.InitializeModel();

        return recognizer;
    }

    private async InitializeModel()
    {
        if (OrchestratorRecognizer._modelPath == null)
        {
            throw new exception(`Missing "ModelPath" information.`);
        }

        if (this._snapShotPath == null)
        {
            throw new exception(`Missing "ShapshotPath" information.`);
        }

        if (OrchestratorRecognizer._orchestrator == null)
        {
            var fullModelPath = path.resolve(OrchestratorRecognizer._modelPath);

            // Create Orchestrator 
            
            OrchestratorRecognizer._orchestrator = new oc.Orchestrator();
          
            if (fullModelPath) {
                if (await OrchestratorRecognizer._orchestrator.load(fullModelPath) === false) {
                    throw new exception(`Model load failed.`);
                }
            }
        }

        if (this._resolver == null)
        {
            var fullSnapShotPath = path.resolve(this._snapShotPath);

            // Load the snapshot
            const encoder: TextEncoder = new TextEncoder();
            const fileContent: string = ReadText.readSync(fullSnapShotPath)
            const snapshot: Uint8Array = encoder.encode(fileContent);

            // Load shapshot and create resolver
            this._resolver = OrchestratorRecognizer._orchestrator.createLabelResolver(snapshot);
        }
    }

    private AddTopScoringIntent(result: any, recognizerResult: RecognizerResult)
    {
        var topScoringIntent = result[0].label.name;
        if (!recognizerResult.Intents[topScoringIntent])
        {
            recognizerResult.Intents.topScoringIntent = {
                Score : result[0].score
            };
        }

        return recognizerResult;
    }
   
};