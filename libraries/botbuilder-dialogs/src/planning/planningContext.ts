/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext, DialogState } from '../dialogContext';

export interface PlanningState<O extends Object> {
    options: O;
    plan?: PlanState;
    savedPlans?: PlanState[];
    result?: any;
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
    beginPlan = 'beginPlan',
    doNow = 'doNow',
    doBeforeTags = 'doBeforeTags',
    doLater = 'doLater',
    endPlan = 'endPlan'
}

export interface PlanChange {
    type: PlanChangeType;
    title?: string;
    tags?: string[];
    dialogId?: string;
    dialogOptions?: object;    
}


export enum PlanningEventNames {
    beginDialog = 'beginDialog',
    continueDialog = 'continueDialog',
    activityReceived = 'activityReceived',
    utteranceRecognized = 'utteranceRecognized',
    fallback = 'fallback',
    planStarted = 'planStarted',
    planSaved = 'planSaved',
    planEnded = 'planEnded',
    planResumed = 'planResumed'
}

/**
 * Values passed to the `PlanningContext` constructor.
 */
export interface PlanningInfo<O extends object> {
    /**
     * The current set of plans.
     */
    plans: PlanningState<O>;

    /**
     * Name of the current event being evaluated.
     */
    eventName: string;

    /**
     * (Optional) value for the current event.
     */
    eventValue?: object;
}

export class PlanningContext<O extends object = {}> extends DialogContext {
    private _info: PlanningInfo<O>;

    /**
     * Creates a new `PlanningContext` instance.
     * @param dc The dialog context for the current turn of conversation.
     * @param info Values to initialize the planning context with.
     */
    constructor(dc: DialogContext, info: PlanningInfo<O>) {
        super(dc.dialogs, dc.context, { dialogStack: dc.stack }, dc.state.user, dc.state.conversation);
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
        return this._info.plans.options;
    }

    /**
     * Name of the current event being evaluated.
     */
    public get eventName(): string {
        return this._info.eventName;
    }

    /**
     * (Optional) value for the current event.
     */
    public get eventValue(): object|undefined {
        return this._info.eventValue;
    }

    /**
     * Applies a set of changes to the current set of plans.
     * @param planChanges List of changes to apply. 
     */
    public async applyChanges(planChanges: PlanChangeList): Promise<void> {
        const changes = planChanges.changes;
        let planStarted = false;
        let planResumed = false;
        let planEnded = false;
        let planSaved = false;
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            switch (change.type) {
                case PlanChangeType.beginPlan:
                    planSaved = this.beginPlan(change);
                    planStarted = true;
                    planEnded = false;
                    planResumed = false;
                    break;
                case PlanChangeType.endPlan:
                    planResumed = this.endPlan();
                    planEnded = true;
                    break;
                case PlanChangeType.doLater:
                    if (this.addStep(change, true)) { planStarted = true }
                    break;
                case PlanChangeType.doNow:
                    if (this.addStep(change, false)) { planStarted = true }
                    break;
                case PlanChangeType.doBeforeTags:
                    if (this.addStepBeforeTags(change)) { planStarted = true }
                    break;
            }
        }

        // Emit change events
        if (planStarted) {
            if (planSaved) {
                await this.emitEvent(PlanningEventNames.planSaved, undefined, false); 
            }
            await this.emitEvent(PlanningEventNames.planStarted, undefined, false);
        } else if (planEnded) {
            if (planResumed) {
                await this.emitEvent(PlanningEventNames.planResumed, undefined, false);
            } else {
                await this.emitEvent(PlanningEventNames.planEnded, undefined, false);
            }
        }
    }

    private beginPlan(change: PlanChange): boolean {
        let savedPlan = false;
        const plans = this._info.plans;
        if (plans.plan) {
            // Save current plan
            if (!plans.savedPlans) {
                plans.savedPlans = [];
            }
            plans.savedPlans.push(plans.plan);
            savedPlan = true;
        }
        plans.plan = {
            title: change.title,
            steps: []
        };
        return savedPlan;
    }

    private endPlan(): boolean {
        let planResumed = false;
        const plans = this._info.plans;
        if (plans.savedPlans && plans.savedPlans.length > 0) {
            plans.plan = plans.savedPlans.pop();
            planResumed = true;
        } else if (plans.plan) {
            delete plans.plan;
        }
        return planResumed;
    }

    private addStep(change: PlanChange, beforeSteps: boolean): boolean {
        let planStarted = false;
        const plans = this._info.plans;
        if (!plans.plan) {
            plans.plan = {
                steps: []
            };
            planStarted = true;
        }
        const step: PlanStepState = {
            dialogStack: [],
            dialogId: change.dialogId,
            dialogOptions: change.dialogOptions
        };
        if (beforeSteps) {
            plans.plan.steps.unshift(step);
        } else {
            plans.plan.steps.push(step);
        }
        return planStarted;
    }

    private addStepBeforeTags(change: PlanChange): boolean {
        const plans = this._info.plans;
        const step: PlanStepState = {
            dialogStack: [],
            dialogId: change.dialogId,
            dialogOptions: change.dialogOptions
        };
        if (!plans.plan) {
            // Start a new plan containing step
            plans.plan = {
                steps: [step]
            };
            return true;
        } else {
            // Search for tag to insert step before
            for (let index = 0; index < plans.plan.steps.length; index++) {
                const dialogId = plans.plan.steps[index].dialogId;
                const dialog = this.findDialog(dialogId);
                if (dialog && dialog.tags.length) {
                    for (let j = 0; j < dialog.tags.length; j++) {
                        if (change.tags.indexOf(dialog.tags[j]) >= 0) {
                            // Insert step before current index
                            plans.plan.steps.splice(index, 0, step);
                            return false;
                        }
                    }
                }
            }

            // Tag not found so just append step
            plans.plan.steps.push(step);
            return false;
        }
    }
}

