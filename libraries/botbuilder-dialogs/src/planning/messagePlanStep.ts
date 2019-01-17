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

export class MessagePlanStep extends PlanStep {
    private readonly expression: RegExp;

    constructor (expression: RegExp, dialogOrId: Dialog|string, transform?: PlanTransform, activationRule?: PlanStepActivationRule|CustomPlanStepActivationRule) {
        super(dialogOrId, transform || PlanTransform.startNewPlan, activationRule || PlanStepActivationRule.alwaysActive);
        this.expression = expression;
    }

    public async recognizeStep(dc: DialogContext, recognized: RecognizerResult, planStack: PlanState[]): Promise<RecognizedPlanStep|undefined> {
        const activity = dc.context.activity;
        const matched = activity.type === ActivityTypes.Message ? this.expression.exec(activity.text || '') : undefined;
        if (matched && await this.activationRule(dc, planStack)) {
            // Create a new recognizer result containing any capture groups
            const score = matched[0].length / activity.text.length;
            const dialogOptions: RecognizerResult = {
                text: activity.text,
                intents: { [activity.type]: { score: score } },
                entities: matched['groups'] || {}
            }
            for (let i = 0; i < matched.length; i++) {
                dialogOptions.entities[i.toString()] = matched[i];
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