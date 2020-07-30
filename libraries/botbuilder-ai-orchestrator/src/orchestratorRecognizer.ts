/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { exception } from 'console';
import { resolve } from 'path';
import { TurnContext, RecognizerResult } from 'botbuilder-core';
import { Configurable } from 'botbuilder-dialogs';
import { existsSync } from 'fs';
const oc: any = require('@microsoft/orchestrator-core/orchestrator-core.node');
const ReadText: any = require('read-text-file');

export class OrchestratorRecognizer extends Configurable {
    /**
     * Full recognition results are available under this property
     */
    public readonly resultProperty : string = "result";
    
    private readonly unknownIntentFilterScore = 0.4;
    private readonly noneIntent : string = "None";
    private static orchestrator : any = null;
    private modelPath : string = null;
    private snapshotPath : string = null;
    private resolver : any = null;

    /**
     * Creates a new OrchestratorRecognizer instance.
     * @param modelPath path to the model to load.
     * @param snapshotPath path to the snapshot (.blu file) to load.
     */
    constructor(modelPath: string, snapshotPath: string) {
        super()
        if (modelPath === null) {
            throw new exception(`Missing "ModelPath" information.`);
        }

        if (snapshotPath === null) {
            throw new exception(`Missing "SnapshotPath" information.`);
        }

        this.modelPath = modelPath;
        this.snapshotPath = snapshotPath;
        
        this.initializeModel();
    }

    /**
     * Returns recognition result. Also sends trace activity with recognition result.
     * @param context Context for the current turn of conversation with the use.
     */
    public async recognizeAsync(context: TurnContext): Promise<RecognizerResult> 
    {
        let result = await this.recongizeTextAsync(context.activity.text);
        await context.sendTraceActivity('OrchestratorRecognizer', result, 'RecognizerResult', 'Orchestrator recognizer RecognizerResult');
        return result;
    }

    /**
     * Returns recognition result. 
     * @param text Text to recognize.
     */
    public async recongizeTextAsync(text : string) : Promise<RecognizerResult>
    {
        const recognizerResult: RecognizerResult = {
            text: text,
            intents: {},
            entities: {}
        };

        var text = text || '';

        if (text === '')
        {
            return recognizerResult;    
        }

        console.time("Orchestrator recognize");
        var result = this.resolver.score(text);
        console.timeEnd("Orchestrator recognize");

        if (Object.entries(result).length !== 0) 
        {
            this.AddTopScoringIntent(result, recognizerResult);
        }

        recognizerResult[this.resultProperty] = result;
        
        if (Object.entries(recognizerResult.intents).length === 0)
        {
            recognizerResult.intents[this.noneIntent] = { score: 1.0 };
        }

        
        return Promise.resolve<RecognizerResult>(recognizerResult);
    }

    private initializeModel() {
        if (this.modelPath == null) {
            throw new exception(`Missing "ModelPath" information.`);
        }

        if (this.snapshotPath == null) {
            throw new exception(`Missing "ShapshotPath" information.`);
        }

        const fullModelPath = resolve(this.modelPath);
        const fullSnapshotPath = resolve(this.snapshotPath);
        if (!existsSync(fullModelPath)) {
            throw new exception(`Model folder does not exist at ${fullModelPath}.`);   
        }
        if (!existsSync(fullSnapshotPath)) {
            throw new exception(`Snapshot file does not exist at ${fullSnapshotPath}.`);
        }

        if (OrchestratorRecognizer.orchestrator == null) {
            console.time("Model load");
            // Create orchestrator core
            OrchestratorRecognizer.orchestrator = new oc.Orchestrator();
            if (OrchestratorRecognizer.orchestrator.load(fullModelPath) === false) {
                throw new exception(`Model load failed.`);
            }
            console.timeEnd("Model load");
        }

        if (this.resolver == null) {
            // Load the snapshot
            const encoder: TextEncoder = new TextEncoder();
            const fileContent: string = ReadText.readSync(fullSnapshotPath)
            const snapshot: Uint8Array = encoder.encode(fileContent);

            // Load shapshot and create resolver
            this.resolver = OrchestratorRecognizer.orchestrator.createLabelResolver(snapshot);
        }
    }

    private AddTopScoringIntent(result: any, recognizerResult: RecognizerResult): RecognizerResult {
        const topScoringIntent = result[0].label.name;
        const topScore = result[0].score;
        
        // if top scoring intent is less than threshold, return None
        if (topScore < this.unknownIntentFilterScore)
        {
            recognizerResult.intents['None'] = { score: 1.0 };
        } else {
            if (!recognizerResult.intents[topScoringIntent]) {
                recognizerResult.intents[topScoringIntent] = {
                    score: topScore
                };
            }
        }

        return recognizerResult;
    }
};
