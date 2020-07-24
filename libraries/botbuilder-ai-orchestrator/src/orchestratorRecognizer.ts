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
const oc = require('@microsoft/orchestrator-core/orchestrator-core.node');
const ReadText: any = require('read-text-file');

export class OrchestratorRecognizer extends Configurable {
    
    public readonly resultProperty : string = "Result";
    private readonly unknownIntentFilterScore = 0.4;
    private readonly noneIntent : string = "None";
    private static orchestrator : any = null;
    private modelPath : string = null;
    private snapshotPath : string = null;
    private resolver : any = null;

    public recognize(context: TurnContext): Promise<RecognizerResult> 
    {
        return Promise.resolve<RecognizerResult>(this.recongizeText(context.activity.text))
    }

    public async recongizeText(text : string) : Promise<RecognizerResult>
    {
        var recognizerResult : RecognizerResult;
        var text = text || '';

        if (text === '')
        {
            return recognizerResult;    
        }

        var result = this.resolver.score(text);

        if (Object.entries(result).length !== 0) 
        {
            this.AddTopScoringIntent(result, recognizerResult);
        }

        recognizerResult[this.resultProperty] = result;
        
        if (Object.entries(recognizerResult.intents).length === 0)
        {
            recognizerResult.intents['None'] = { score: 1.0 };
        }

        return recognizerResult;
    }

    public static async createRecognizerAsync(modelPath: string, snapShotPath: string): Promise<OrchestratorRecognizer> {
        if (modelPath === null) {
            throw new exception(`Missing "ModelPath" information.`);
        }

        if (snapShotPath === null) {
            throw new exception(`Missing "SnapshotPath" information.`);
        }

        const recognizer = new OrchestratorRecognizer();
        recognizer.modelPath = modelPath;
        recognizer.snapshotPath = snapShotPath;
        
        await recognizer.initializeModel();
        return recognizer;
    }

    private async initializeModel(): Promise<void> {
        if (this.modelPath == null) {
            throw new exception(`Missing "ModelPath" information.`);
        }

        if (this.snapshotPath == null) {
            throw new exception(`Missing "ShapshotPath" information.`);
        }

        if (OrchestratorRecognizer.orchestrator == null) {
            const fullModelPath = resolve(this.modelPath);

            // Create Orchestrator 
            
            OrchestratorRecognizer.orchestrator = new oc.Orchestrator();
          
            if (fullModelPath) {
                if (await OrchestratorRecognizer.orchestrator.load(fullModelPath) === false) {
                    throw new exception(`Model load failed.`);
                }
            }
        }

        if (this.resolver == null) {
            const fullSnapShotPath = resolve(this.snapshotPath);

            // Load the snapshot
            const encoder: TextEncoder = new TextEncoder();
            const fileContent: string = ReadText.readSync(fullSnapShotPath)
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
                recognizerResult.intents.topScoringIntent = {
                    score: result[0].score
                };
            }
        }

        return recognizerResult;
    }
};
