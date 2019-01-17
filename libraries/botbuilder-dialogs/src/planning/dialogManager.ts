/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, StatePropertyAccessor, RecognizerResult, ActivityTypes, ConversationState, MemoryStorage, UserState } from 'botbuilder-core';
import { Dialog, DialogTurnResult, DialogTurnStatus } from './dialog';
import { DialogContext, DialogState } from './dialogContext';
import { ComponentDialog } from './componentDialog';

const DEFAULT_MAIN_DIALOG_ID = 'main';
const NONE_INTENT = 'None';

export const enum DialogManagerStateFields {
    lastAccess = 'lastAccess',
    planStack = 'planStack',
    sessionTimeout = 'sessionTimeout'
}

export interface Recognizer {
    recognize(context: TurnContext): Promise<RecognizerResult>;
}

export enum IntentActivationRule {
    alwaysActive = 'alwaysActive',
    ifPlanActive = 'ifPlanActive',
    ifNoPlanActive = 'ifNoPlanActive'
}

export enum IntentPlanningRule {
    startNewPlan = 'startNewPlan',
    prependToPlan = 'prependToPlan',
    appendToPlan = 'appendToPlan'
}

export interface DialogManagerPlan {
    steps: DialogManagerPlanStep[];
}

export interface DialogManagerPlanStep {
    dialogId?: string;
    dialogOptions?: object;
    dialogState?: DialogState;
}

export interface DialogManagerOptions {
    sessionTimeout?: number;
}


export interface IntentMapping {
    intentName: string;
    dialogId: string;
    planningRule: IntentPlanningRule;
    activationRule: IntentActivationRule;
}

export class DialogManager<O extends DialogManagerOptions = {}> extends ComponentDialog<O> {
    private readonly intents: { [name:string]: IntentMapping; } = {};

    public recognizer: Recognizer;

    /**
     * Creates a new DialogManager instance.
     */
    constructor(conversationState?: StatePropertyAccessor<DialogState>, userState?: StatePropertyAccessor<object>, dialogId = DEFAULT_MAIN_DIALOG_ID) {
        super(dialogId, conversationState, userState);
    }

    public addIntent(intentName: string, dialog: Dialog, planningRule?: IntentPlanningRule, activationRule?: IntentActivationRule): this {
        if (this.intents.hasOwnProperty(intentName)) { throw new Error(`DialogManager: an intent named '${intentName}' has already been added.`); }
        this.addDialog(dialog);
        this.intents[intentName] = {
            intentName: intentName,
            dialogId: dialog.id,
            planningRule: planningRule || IntentPlanningRule.startNewPlan,
            activationRule: activationRule || IntentActivationRule.alwaysActive
        };

        return this;
    }

    protected async onRunTurn(innerDC: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Save session timeout on start
        const state = innerDC.componentState;
        if (options && typeof options.sessionTimeout === 'number') {
            state.set(DialogManagerStateFields.sessionTimeout, options.sessionTimeout);
        }

        // Check for session expiration
        const lastAccess = state.has(DialogManagerStateFields.lastAccess) ? new Date(state.get(DialogManagerStateFields.lastAccess)) : new Date();
        const sessionTimeout = state.get(DialogManagerStateFields.sessionTimeout);
        if (typeof sessionTimeout === 'number') {
            await this.onExpireSession(innerDC, lastAccess, sessionTimeout);
        }

        // Run recognition phase
        const recognized = await this.onRecognize(innerDC);

        // Run planning phase
        const planStack: DialogManagerPlan[] = state.has(DialogManagerStateFields.planStack) ? state.get(DialogManagerStateFields.planStack) : [];

        // Run execution phase
        const result = await this.onExecute(innerDC, planStack);

        // Save state
        state.set(DialogManagerStateFields.lastAccess, new Date().toUTCString());
        state.set(DialogManagerStateFields.planStack, planStack);

        return result;
    }

    protected async onExpireSession(innerDC: DialogContext, lastAccess: Date, timeout: number): Promise<void> {
        const ellapsed = new Date().getTime() - lastAccess.getTime();
        if (ellapsed >= timeout) {
            // Expire the session
            innerDC.sessionState.clear();
            innerDC.componentState.clear();
        }
    }

    protected async onRecognize(innerDC: DialogContext): Promise<RecognizerResult> {
        if (this.recognizer) {
            return await this.recognizer.recognize(innerDC.context);
        } else {
            return { text: innerDC.context.activity.text, intents: { [NONE_INTENT]: { score: 0.0 } } };
        }
    }

    protected async onPlan(innerDC: DialogContext, recognized: RecognizerResult, planStack: DialogManagerPlan[]): Promise<void> {
        // Filter to recognized and activated intents
        const intents = this.getRecognizedIntents(innerDC, recognized);

        // Apply intents to current plan
        this.updatePlanWithIntents(innerDC, intents, recognized, planStack);
    }

    protected async onExecute(innerDC: DialogContext, planStack: DialogManagerPlan[]): Promise<DialogTurnResult> {
        
    }

    protected getRecognizedIntents(dc: DialogContext, recognized: RecognizerResult): IntentMapping[] {
        const intents: IntentMapping[] = [];
        const planStack = dc.componentState.get(DialogManagerStateFields.planStack) || [];
        const isPlanActive = planStack.length > 0;
        for (const name in recognized.intents) {
            if (this.intents.hasOwnProperty(name)) {
                const intent = this.intents[name];
                switch (intent.activationRule) {
                    case IntentActivationRule.alwaysActive:
                        intents.push(intent);
                        break;
                    case IntentActivationRule.ifNoPlanActive:
                        if (!isPlanActive) { intents.push(intent); }
                        break;
                    case IntentActivationRule.ifPlanActive:
                    if (isPlanActive) { intents.push(intent); }
                    break;
                }
            }
        }
        return intents;
    }

    protected updatePlanWithIntents(dc: DialogContext, intents: IntentMapping[], dialogOptions?: object, planStack?: DialogManagerPlan[]): DialogManagerPlan[] {
        // Get plan stack
        if (!planStack) {
            planStack = dc.componentState.get(DialogManagerStateFields.planStack) || [];
        }

        // Check for new plan being started
        let newPlan: DialogManagerPlan;
        for (let i = 0; i < intents.length; i++) {
            const intent = intents[i];
            if (intent.planningRule === IntentPlanningRule.startNewPlan) {
                const step: DialogManagerPlanStep = { dialogId: intent.dialogId, dialogOptions: dialogOptions };
                if (!newPlan) { 
                    newPlan = { steps: [step] };
                } else {
                    newPlan.steps.push(step);
                }
            }
        }
        if (newPlan) {
            planStack.push(newPlan);
        }

        // Apply any plan modifications
        let currentPlan: DialogManagerPlan = planStack.length > 0 ? planStack[planStack.length - 1] : undefined;        
        for (let i = 0; i < intents.length; i++) {
            const intent = intents[i];
            if (intent.planningRule !== IntentPlanningRule.startNewPlan) {
                // Check for case where we have an empty plan stack but have encountered a modification
                if (!currentPlan) {
                    currentPlan = { steps:[] };
                    planStack.push(currentPlan);
                }

                // Apply modification
                const step: DialogManagerPlanStep = { dialogId: intent.dialogId, dialogOptions: dialogOptions };
                switch (intent.planningRule) {
                    case IntentPlanningRule.appendToPlan:
                        currentPlan.steps.push(step);
                        break;
                    case IntentPlanningRule.prependToPlan:
                        currentPlan.steps.unshift(step);
                        break;
                }
            }
        }

        return planStack;
    }
}
