/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { RecognizerResult, ActivityTypes } from 'botbuilder-core';
import { PlanStep, RecognizedPlanStep, PlanTransform, PlanStepActivationRule, CustomPlanStepActivationRule } from './planStep';
import { PlanState } from './planState';
import { DialogContext } from '../dialogContext';
import { Dialog } from '../dialog';

export class AnyIntentPlanStep extends PlanStep {
    private readonly intents: string[];

    constructor (intents: string[], dialogOrId: Dialog|string, transform?: PlanTransform, activationRule?: PlanStepActivationRule|CustomPlanStepActivationRule) {
        super(dialogOrId, transform || PlanTransform.startNewPlan, activationRule || PlanStepActivationRule.alwaysActive);
        this.intents = intents;
    }

    public async recognizeStep(dc: DialogContext, recognized: RecognizerResult, planStack: PlanState[]): Promise<RecognizedPlanStep|undefined> {
        // Check for any intent to match
        const activity = dc.context.activity;
        let matches = false;
        if (activity.type === ActivityTypes.Message) {
            for (let i = 0; i < this.intents.length; i++) {
                if (recognized.intents.hasOwnProperty(this.intents[i])) {
                    matches = true;
                    break;
                }
            }
        }

        if (matches && await this.activationRule(dc, planStack)) {
            return {
                transform: this.transform,
                dialogId: this.dialogId,
                dialogOptions: recognized
            };
        }
    }
}