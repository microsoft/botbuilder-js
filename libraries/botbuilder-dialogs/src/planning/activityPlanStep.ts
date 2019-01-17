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
import { IntentPlanStep } from './intentPlanStep';

export class ActivityPlanStep extends PlanStep {
    private readonly type: string;

    constructor (type: string, dialogOrId: Dialog|string, transform?: PlanTransform, activationRule?: PlanStepActivationRule|CustomPlanStepActivationRule) {
        super(dialogOrId, transform || PlanTransform.startNewPlan, activationRule || PlanStepActivationRule.alwaysActive);
        this.type = type;
    }

    public async recognizeStep(dc: DialogContext, recognized: RecognizerResult, planStack: PlanState[]): Promise<RecognizedPlanStep|undefined> {
        const activity = dc.context.activity;
        if (activity.type === this.type && await this.activationRule(dc, planStack)) {
            // Create a new recognizer result containing the activity as entities
            const dialogOptions: RecognizerResult = {
                text: activity.text,
                intents: { [activity.type]: { score: 1.0 } },
                entities: activity
            }

            // Return step
            return {
                transform: this.transform,
                dialogId: this.dialogId,
                dialogOptions: dialogOptions
            };
        }
    }
}
