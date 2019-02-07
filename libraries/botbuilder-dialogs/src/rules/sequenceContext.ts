/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext, DialogState } from '../dialogContext';

export interface PlanningState {
    plan?: PlanState;
    savedPlans?: PlanState[]; 
}

export interface PlanState {
    title?: string;
    steps: PlanStepState[];
}

export interface PlanStepState extends DialogState {
    dialogId: string;
    dialogOptions?: object;
}

export interface PlanChangeList {
    changes: PlanChange[];
    intentsMatched?: string[];
    entitiesMatched?: string[];
}

export enum PlanChangeType {
    beginPlan = 'beginSequence',
    insertBeforeSteps = 'insertBeforeSteps',
    insertBeforeLabel = 'insertBeforeLabel',
    appendAfterSteps = 'appendAfter',
    endPlan = 'endSequence'
}

export interface PlanChange {
    type: PlanChangeType;
    title?: string;
    label?: string;
    dialogId?: string;
    dialogOptions?: object;    
}

/**
 * Values passed to the `PlanningContext` constructor.
 */
export interface PlanningInfo<O extends object> {
    /**
     * The current set of plans.
     */
    plans: PlanningState;

    /**
     * Any options passed to `PlanningDialog.beginDialog()` or `SequenceDialog.beginDialog()`.
     */
    options: O;

    /**
     * Name of the current event being evaluated.
     */
    eventName: string;

    /**
     * (Optional) arguments for the current event.
     */
    eventArgs?: object;
}

export class PlanningContext<O extends object = {}> extends DialogContext {
    private _info: PlanningInfo<O>;

    /**
     * Creates a new `PlanningContext` instance.
     * @param dc The dialog context for the current turn of conversation.
     * @param info Values to initialize the planning context with.
     */
    constructor(dc: DialogContext, info: PlanningInfo<O>) {
        super(dc.dialogs, dc.context, { dialogStack: dc.stack }, dc.conversationState, dc.userState);
        this._info = info;
        this.parent = dc.parent;
    }

    /**
     * The current plan being executed (if any.)
     */
    public get plan(): PlanState|undefined {
        return this._info.plans.plan;
    }

    /**
     * Returns true if there are 1 or more saved plans.
     */
    public get hasSavedPlans(): boolean {
        const plans = this._info.plans;
        return plans.savedPlans && plans.savedPlans.length > 0;
    }

    /**
     * Any options passed to `PlanningDialog.beginDialog()` or `SequenceDialog.beginDialog()`.
     */
    public get options(): O {
        return this._info.options;
    }

    /**
     * Name of the current event being evaluated.
     */
    public get eventName(): string {
        return this._info.eventName;
    }

    /**
     * (Optional) arguments for the current event.
     */
    public get eventArgs(): object|undefined {
        return this._info.eventArgs;
    }

    /**
     * Applies a set of changes to the current set of plans.
     * @param planChanges List of changes to apply. 
     */
    public async applyChanges(planChanges: PlanChangeList): Promise<void> {
        const changes = planChanges.changes;
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            switch (change.type) {
                case PlanChangeType.beginPlan:
                    this.beginPlan(change);
                    break;
                case PlanChangeType.endPlan:
                    this.endPlan();
                    break;
                case PlanChangeType.appendAfterSteps:
                    this.addStep(change, true);
                    break;
                case PlanChangeType.insertBeforeSteps:
                    this.addStep(change, false);
                    break;
                case PlanChangeType.insertBeforeLabel:

            }
        }
    }

    private beginPlan(change: PlanChange): boolean {
        let savedSequence = false;
        const sequences = this._info.plans;
        if (sequences.plan) {
            // Save current sequence
            if (!sequences.savedPlans) {
                sequences.savedPlans = [];
            }
            sequences.savedPlans.push(sequences.plan);
            savedSequence = true;
        }
        sequences.plan = {
            title: change.title,
            steps: []
        };
        return savedSequence;
    }

    private endPlan(): boolean {
        let sequenceResumed = false;
        const sequences = this._info.plans;
        if (sequences.savedPlans && sequences.savedPlans.length > 0) {
            sequences.plan = sequences.savedPlans.pop();
            sequenceResumed = true;
        } else if (sequences.plan) {
            delete sequences.plan;
        }
        return sequenceResumed;
    }

    private addStep(change: PlanChange, beforeSteps: boolean): boolean {
        let sequenceStarted = false;
        const sequences = this._info.plans;
        if (!sequences.plan) {
            sequences.plan = {
                steps: []
            };
            sequenceStarted = true;
        }
        const step: PlanStepState = {
            dialogStack: [],
            dialogId: change.dialogId,
            dialogOptions: change.dialogOptions
        };
        if (beforeSteps) {
            sequences.plan.steps.unshift(step);
        } else {
            sequences.plan.steps.push(step);
        }
        return sequenceStarted;
    }

    private addStep(change: PlanChange, beforeSteps: boolean): boolean {
        let sequenceStarted = false;
        const sequences = this._info.plans;
        if (!sequences.plan) {
            sequences.plan = {
                steps: []
            };
            sequenceStarted = true;
        }
        const step: PlanStepState = {
            dialogStack: [],
            dialogId: change.dialogId,
            dialogOptions: change.dialogOptions
        };
        if (beforeSteps) {
            sequences.plan.steps.unshift(step);
        } else {
            sequences.plan.steps.push(step);
        }
        return sequenceStarted;
    }
}

