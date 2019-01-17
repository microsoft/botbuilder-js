/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { RecognizerResult } from 'botbuilder-core';
import { PlanState, PlanStepState } from './planState';
import { DialogContext } from '../dialogContext'; 
import { Dialog } from '../dialog';

export enum PlanTransform {
    startNewPlan = 'startNewPlan',
    prependToPlan = 'prependToPlan',
    appendToPlan = 'appendToPlan'
}

export enum PlanStepActivationRule {
    alwaysActive = 'alwaysActive',
    ifPlanActive = 'ifPlanActive',
    ifNoPlanActive = 'ifNoPlanActive'
}

export interface RecognizedPlanStep {
    transform: PlanTransform;
    dialogId: string;
    dialogOptions?: object;
}

export type CustomPlanStepActivationRule = (dc: DialogContext, planStack: PlanState[]) => Promise<boolean>;

export abstract class PlanStep {
    protected readonly dialogId: string;
    protected readonly transform: PlanTransform;
    protected readonly activationRule: CustomPlanStepActivationRule;

    public readonly dialog: Dialog|undefined;

    constructor (dialogOrId: Dialog|string, transform: PlanTransform, activationRule: PlanStepActivationRule|CustomPlanStepActivationRule) {
        if (typeof dialogOrId === 'object') {
            this.dialog = dialogOrId;
            this.dialogId = dialogOrId.id;
        } else {
            this.dialogId = dialogOrId;
        }
        this.transform = transform;
        if (typeof activationRule === 'function') {
            this.activationRule = activationRule;
        } else {
            this.activationRule = async (dc, planStack) => {
                switch (activationRule) {
                    case PlanStepActivationRule.alwaysActive:
                        return true;
                    case PlanStepActivationRule.ifNoPlanActive:
                        return planStack.length == 0;
                    case PlanStepActivationRule.ifPlanActive:
                        return planStack.length > 0;
                }
            };
        }
    }

    public abstract recognizeStep(dc: DialogContext, recognized: RecognizerResult, planStack: PlanState[]): Promise<RecognizedPlanStep|undefined>;
}
