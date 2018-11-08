/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, RecognizerResult, ActivityTypes, Activity } from 'botbuilder-core';
import { Dialog, DialogTurnResult, DialogReason } from './dialog';
import { DialogContext } from './dialogContext';
import { IntentDialogContext } from './intentDialogContext';

export enum CommonIntents {
    Begin = 'Begin',
    None = 'None',
    Resume = 'Resume'
}

export type IntentRecognizer = { recognize(context: TurnContext): Promise<RecognizerResult>; };

export class IntentDialog<O extends object = {}> extends Dialog<O> {
    public readonly intents: { [name: string]: (intent: IntentDialogContext) => Promise<DialogTurnResult>; } = {};
    public recognizer: IntentRecognizer|undefined;
    public beginIntent: string = CommonIntents.Begin;
    public noneIntent: string = CommonIntents.None;
    public resumeIntent: string = CommonIntents.Resume;
    public minScore: number = 0.0;

    constructor(dialogId: string, recognizer?: IntentRecognizer) {
        super(dialogId);
        this.recognizer = recognizer;
    }
    
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Initialize dialog state
        const state: IntentDialogState = dc.activeDialog.state;
        state.turn = -1;
        state.options = options || {};
        state.values = {};

        // Process turn
        return await this.processTurn(dc, DialogReason.beginCalled);
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Don't do anything for non-message activities
        if (dc.context.activity.type !== ActivityTypes.Message) {
            return Dialog.EndOfTurn;
        }

        // Process turn
        return await this.processTurn(dc, DialogReason.continueCalled);
    }


    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // Process turn
        return await this.processTurn(dc, reason, result);
    }

    public onIntent(name: string, handler: (intent: IntentDialogContext) => Promise<DialogTurnResult>): this {
        if (this.hasIntent(name)) { throw new Error(`IntentDialog.onIntent(): an intent named '${name}' has already been registered.`) }
        this.intents[name] = handler;
        return this;
    }

    public beginDialogIntent(name: string, dialogId: string): this {
        return this.onIntent(name, async (intent) => {
            return await intent.beginDialog(dialogId, intent.recognized);
        });
    }

    public cancelAllDialogsIntent(name: string): this {
        return this.onIntent(name, async (intent) => {
            return await intent.cancelAllDialogs();
        });
    }

    public endDialogIntent(name: string): this {
        return this.onIntent(name, async (intent) => {
            return await intent.endDialog();
        });
    }

    public replaceDialogIntent(name: string, dialogId: string): this {
        return this.onIntent(name, async (intent) => {
            return await intent.replaceDialog(dialogId, intent.recognized);
        });
    }

    public repromptDialogIntent(name: string): this {
        return this.onIntent(name, async (intent) => {
            await intent.repromptDialog();
            return Dialog.EndOfTurn;
        });
    }

    public sendActivityIntent(name: string, activityOrText: string | Partial<Activity>, speak?: string, inputHint?: string): this {
        return this.onIntent(name, async (intent) => {
            await intent.context.sendActivity(activityOrText, speak, inputHint);
            return Dialog.EndOfTurn;
        });
    }

    protected async onRecognize(context: TurnContext): Promise<RecognizerResult|undefined> {
        if (this.recognizer) {
            return await this.recognizer.recognize(context);
        }
        return undefined;
    }

    protected async onRunTurn(intent: IntentDialogContext): Promise<DialogTurnResult> {
        if (intent.reason === DialogReason.beginCalled) {
            if (this.hasIntent(this.beginIntent)) {
                return await this.runIntent(this.beginIntent, intent);
            }
        } else if (intent.reason === DialogReason.endCalled) {
            if (this.hasIntent(this.resumeIntent)) {
                return await this.runIntent(this.resumeIntent, intent);
            }
        } else if (intent.recognized) {
            const name = this.findTopIntent(intent.recognized);
            if (this.hasIntent(name)) {
                return await this.runIntent(name, intent);
            }
        }
        return Dialog.EndOfTurn;
    }

    protected findTopIntent(recognized?: RecognizerResult): string {
        if (recognized && recognized.intents) {
            // Find top scoring intent
            let topName = this.noneIntent;
            let topScore = 0;
            for (const name in recognized.intents) {
                const score = recognized.intents[name].score;
                if (score > this.minScore && score > topScore) {
                    topName = name;
                    topScore = score;
                }
            }

            // Filter to intents with dialog mappings
            if (this.hasIntent(topName)) {
                return topName;
            }
        }
        return this.noneIntent;
    }

    protected hasIntent(name: string): boolean {
        return this.intents.hasOwnProperty(name);
    }

    protected async runIntent(name: string, intent: IntentDialogContext): Promise<DialogTurnResult> {
        if (!this.hasIntent(name)) { throw new Error(`IntentDialog.runIntent(): an intent handler for '${name}' couldn't be found.`) }
        return await this.intents[name](intent);
    }

    private async processTurn(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // Increment turn count
        const state: IntentDialogState = dc.activeDialog.state;
        state.turn++;

        // Recognize results
        let recognized: RecognizerResult = undefined;
        if (reason === DialogReason.continueCalled) {
            recognized = await this.onRecognize(dc.context);
        }

        // Create intent context
        const intent: IntentDialogContext<O> = new IntentDialogContext<O>(dc, {
            options: state.options as any,
            reason: reason,
            result: result,
            turn: state.turn,
            values: state.values,
            recognized: recognized
        });

        // Run turn
        return await this.onRunTurn(intent);
    }
}

/**
 * @private
 */
interface IntentDialogState {
    turn: number;
    options: object;
    values: object;
}
