/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext, DialogState, DialogSet } from 'botbuilder-dialogs';

export interface PlanningState<O extends Object> {
    options: O;
    plan?: PlanState;
    savedPlans?: PlanState[];
    changes?: PlanChangeList[];
    result?: any;
}

export interface PlanState {
    title?: string;
    steps: PlanStepState[];
}

export interface PlanStepState extends DialogState {
    dialogId: string;
    options?: object;
}

export interface PlanChangeList {
    changeType: PlanChangeType;
    steps: PlanStepState[];
    tags?: string[];
    intentsMatched?: string[];
    entitiesMatched?: string[];
}

export enum PlanChangeType {
    newPlan = 'newPlan',
    doSteps = 'doSteps',
    doStepsBeforeTags = 'doStepsBeforeTags',
    doStepsLater = 'doStepsLater',
    endPlan = 'endPlan',
    replacePlan = 'replacePlan'
}

export enum PlanningEventNames {
    beginDialog = 'beginDialog',
    consultDialog = 'consultDialog',
    activityReceived = 'activityReceived',
    utteranceRecognized = 'utteranceRecognized',
    fallback = 'fallback',
    planStarted = 'planStarted',
    planSaved = 'planSaved',
    planEnded = 'planEnded',
    planResumed = 'planResumed'
}

export class PlanningContext<O extends object = {}> extends DialogContext {
    private plans: PlanningState<O>;

    /**
     * Creates a new `PlanningContext` instance.
     * @param dc The dialog context for the current turn of conversation.
     * @param info Values to initialize the planning context with.
     */
    constructor(dc: DialogContext, parent: DialogContext, dialogs: DialogSet, state: DialogState, plans: PlanningState<O>) {
        super(dialogs, dc.context, state, dc.state.user, dc.state.conversation);
        this.plans = plans;
        this.parent = parent;
    }

    /**
     * The current plan being executed (if any.)
     */
    public get plan(): PlanState|undefined {
        return this.plans.plan;
    }

    /**
     * Returns true if there are 1 or more saved plans.
     */
    public get hasSavedPlans(): boolean {
        const plans = this.plans;
        return Array.isArray(plans.savedPlans) && plans.savedPlans.length > 0;
    }

    /**
     * Queues up a set of plan changes that will be applied when [applyChanges()](#applychanges)
     * is called.
     * @param changes Plan changes to queue up. 
     */
    public queueChanges(changes: PlanChangeList): void {
        console.log('queuing changes');
        if (!Array.isArray(this.plans.changes)) { this.plans.changes = [] }
        this.plans.changes.push(changes);
    }

    /**
     * Applies any queued up changes.
     * 
     * @remarks
     * Applying a set of changes can result in additional plan changes being queued. The method
     * will loop and apply any additional plan changes until there are no more changes left to 
     * apply.
     * @returns true if there were any changes to apply. 
     */
    public async applyChanges(): Promise<boolean> {
        const changes = this.plans.changes;
        if (Array.isArray(changes)) {
            console.log(`applying changes: ${JSON.stringify(changes)}`);
            delete this.plans.changes;

            // Apply each queued set of changes
            for (let i = 0; i < changes.length; i++) {
                const change = changes[i];
                switch (change.changeType) {
                    case PlanChangeType.newPlan:
                        await this.newPlan(change.steps);
                        break;
                    case PlanChangeType.doSteps:
                        await this.doSteps(change.steps);
                        break;
                    case PlanChangeType.doStepsBeforeTags:
                        await this.doStepsBeforeTags(change.tags, change.steps);
                        break;
                    case PlanChangeType.doStepsLater:
                        await this.doStepsLater(change.steps);
                        break;
                    case PlanChangeType.endPlan:
                        await this.endPlan(change.steps);
                        break;
                    case PlanChangeType.replacePlan:
                        await this.replacePlan(change.steps);
                        break; 
                }
            }

            // Apply any new queued up changes
            await this.applyChanges();
            return true;
        }

        console.log(`applying 0 changes`);
        return false;
    }

    /**
     * Inserts steps at the beginning of the plan to be executed immediately.
     * @param steps Steps to insert at the beginning of the plan.
     * @returns true if a new plan had to be started.
     */
    public async doSteps(steps: PlanStepState[]): Promise<boolean> {
        // Initialize new plan if needed
        const newPlan = this.plans.plan == undefined;
        if (newPlan) { this.plans.plan = { steps: [] } }

        // Insert steps
        const plan = this.plans.plan;
        plan.steps = steps.concat(plan.steps);

        // Emit new plan event
        if (newPlan) {
            await this.emitEvent(PlanningEventNames.planStarted, undefined, false);
        }

        return newPlan;
    }

    /**
     * Appends new steps to the plan but ensures that they're before any steps with a given set 
     * of tag(s).
     * @param tags The tag(s) to check for. 
     * @param steps Steps to add to the plan.
     * @returns true if a new plan had to be started.
     */
    public async doStepsBeforeTags(tags: string[], steps: PlanStepState[]): Promise<boolean> {
        // Initialize new plan if needed
        const newPlan = this.plans.plan == undefined;
        if (newPlan) { this.plans.plan = { steps: [] } }

        // Search for tag to insert steps before
        let found = false;
        const plan = this.plans.plan;
        for (let i = 0; i < plan.steps.length && !found; i++) {
            const dialogId = plan.steps[i].dialogId;
            const dialog = this.findDialog(dialogId);
            if (dialog && dialog.tags.length) {
                for (let j = 0; j < dialog.tags.length; j++) {
                    if (tags.indexOf(dialog.tags[j]) >= 0) {
                        // Insert steps before current index
                        const args = ([i, 0] as any[]).concat(steps);
                        Array.prototype.splice.apply(plan.steps, args);
                        found = true;
                        break;
                    }
                }
            }
        }
        if (!found) {
            plan.steps = plan.steps.concat(steps);
        }

        // Emit new plan event
        if (newPlan) {
            await this.emitEvent(PlanningEventNames.planStarted, undefined, false);
        }

        return newPlan;
    }

    /**
     * Appends steps to the end of the current plan.
     * @param steps Steps to add to plan.
     * @returns true if a new plan had to be started.
     */
    public async doStepsLater(steps: PlanStepState[]): Promise<boolean> {
        // Initialize new plan if needed
        const newPlan = this.plans.plan == undefined;
        if (newPlan) { this.plans.plan = { steps: [] } }

        // Append steps
        const plan = this.plans.plan;
        plan.steps = plan.steps.concat(steps);

        // Emit new plan event
        if (newPlan) {
            await this.emitEvent(PlanningEventNames.planStarted, undefined, false);
        }

        return newPlan;
    }


    /**
     * Ends the current plan and optionally inserts steps at the beginning of any resumed plan. 
     * @param steps (Optional) steps to insert at the beginning of the resumed plan. These steps will be ignored if there is no plan to resume.
     * @returns true if a plan was resumed.
     */
    public async endPlan(steps?: PlanStepState[]): Promise<boolean> {
        const resumePlan = this.plans.savedPlans && this.plans.savedPlans.length > 0;
        if (resumePlan) {
            // Resume the plan
            this.plans.plan = this.plans.savedPlans.pop();
            if (this.plans.savedPlans.length == 0) { delete this.plans.savedPlans }

            // Insert optional steps
            if (steps && steps.length > 0) {
                this.plans.plan.steps = steps.concat(this.plans.plan.steps);
            }

            // Emit resumption event
            await this.emitEvent(PlanningEventNames.planResumed, undefined, true);
        } else if (this.plans.plan) {
            delete this.plans.plan;

            // Emit planning ended event
            await this.emitEvent(PlanningEventNames.planEnded, undefined, false);
        }

        return resumePlan;
    }

    /**
     * Ends the active step for the current plan.
     * 
     * @remarks
     * This can potentially cause the current plan to end and a previous plan to be resumed.
     * @returns true if the plan ended and a previously saved plan was resumed. 
     */
    public async endStep(): Promise<boolean> {
        const plan = this.plans.plan;
        if (plan && plan.steps.length > 0) {
            if (plan.steps.length == 1) {
                return await this.endPlan();
            } else {
                plan.steps.shift();
            }
        }

        return false;
    }

    /**
     * Starts a new plan with a set of steps.
     * @param steps Initial set of steps to assign to the new plan.
     * @returns true if an existing plan was saved.
     */
    public async newPlan(steps: PlanStepState[]): Promise<boolean> {
        // Save existing plan
        const savePlan = this.plans.plan != undefined && this.plans.plan.steps.length > 0;
        if (savePlan) {
            if (this.plans.savedPlans == undefined) { this.plans.savedPlans = [] }
            this.plans.savedPlans.push(this.plans.plan);
        }

        // Initialize plan
        this.plans.plan = { steps: steps }
        
        // Emit plan change events
        if (savePlan) {
            await this.emitEvent(PlanningEventNames.planSaved, undefined, false);
        }
        await this.emitEvent(PlanningEventNames.planStarted, undefined, false);

        return savePlan;
    }
    
    /**
     * Replaces any existing plan with a new plan and steps.
     * @param steps Steps to initialize new plan with.
     * @returns true if an existing plan was replaced.
     */
    public async replacePlan(steps: PlanStepState[]): Promise<boolean> {
        // Update plan
        const planReplaced = this.plans.plan && this.plans.plan.steps.length > 0;
        this.plans.plan = { steps: steps }

        // Emit plan started event
        await this.emitEvent(PlanningEventNames.planStarted, undefined, false);

        return planReplaced;
    }

    /**
     * Changes the title for the current plan.
     * @param title New plan title.
     */
    public updatePlanTitle(title: string): void {
        // Ensure plan exists
        if (!this.plans.plan) { throw new Error(`PlanningContext.updatePlanTitle(): No plan found to update.`) }

        // Update title
        this.plans.plan.title = title;
    }


    public static create<O extends object = {}>(dc: DialogContext, plans: PlanningState<O>): PlanningContext<O> {
        return new PlanningContext<O>(dc, dc.parent, dc.dialogs, { dialogStack: dc.stack }, plans);
    }

    public static createForStep<O extends object = {}>(planning: PlanningContext<O>, dialogs: DialogSet): PlanningContext<O>|undefined {
        const plans = planning.plans;
        if (plans.plan && plans.plan.steps.length > 0) {
            const state = plans.plan.steps[0];
            return new PlanningContext<O>(planning, planning, dialogs, state, plans);
        } else {
            return undefined;
        }
    }
}

