/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PlanningDialog } from '../planningDialog';
import { InputSlot } from './inputSlot';
import { PlanningContext, PlanningEventNames, PlanningState, PlanChangeList, PlanChangeType, PlanStepState } from '../planningContext';
import { DialogEvent, DialogTurnResult, Dialog } from 'botbuilder-dialogs';
import { Activity } from 'botbuilder-core';
import { SendActivity } from '../steps';
import { TextSlot, TextSlotFormat } from './textSlot';
import { NumberSlot, NumberSlotFormat } from './numberSlot';

export interface InputDialogPrompt {
    tagSelector: string[];
    steps: Dialog[]; 
}

export interface InputDialogComputedPlanChange {
    changes: PlanChangeList[];
    expectedSlots: string[];
}

export class InputDialog<O extends object = {}> extends PlanningDialog<O> {
    private planChangeCache: { [key:string]: InputDialogComputedPlanChange; } = {};

    public slots: InputSlot[] = [];
    public prompts: InputDialogPrompt[] = [];
    public stepsBefore: Dialog[];
    public stepsAfter: Dialog[];

    public addSlot(...slots: InputSlot[]): this {
        Array.prototype.push.apply(this.slots, slots);
        return this;
    }

    public addPrompt(tagSelector: string, prompt: string|Partial<Activity>): this;
    public addPrompt(tagSelector: string, steps: Dialog[]): this;
    public addPrompt(tagSelector: string, promptOrSteps: string|Partial<Activity>|Dialog[]): this {
        this.prompts.push({
            tagSelector: tagSelector.split('.'),
            steps: Array.isArray(promptOrSteps) ? promptOrSteps : [new SendActivity(promptOrSteps)]
        });
        return this;
    }

    public doStepBefore(steps: Dialog[]): this {
        this.stepsBefore = steps;
        return this;
    }

    public doStepAfter(steps: Dialog[]): this {
        this.stepsAfter = steps;
        return this;
    }

    public async evaluateRules(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        // Process users input
        let handled = false;
        const state = planning.activeDialog.state as InputDialogState<O>;
        switch (event.name) {
            case PlanningEventNames.beginDialog:
                // Initialize turn count and result object
                state.turnCount = 0;

                // Queue up any before steps
                this.queueSteps(planning, this.stepsBefore, state.options);

                // Validate values and queue prompt
                handled = await this.validateValues(planning, event); 
                if (!handled) {
                    handled = await this.queuePrompt(planning, event);
                }
                break;

            case PlanningEventNames.consultDialog:
                // Just increment turn count
                state.turnCount += 0;
                break;

            case PlanningEventNames.fallback:
                // Recognize users input and queue prompt
                handled = await this.recognizeInput(planning, event);
                if (!handled) {
                    handled = await this.queuePrompt(planning, event);
                }
                break;
        }

        // Let base class try to handle event
        if (!handled) {
            handled = await super.evaluateRules(planning, event);
        }
        return handled;
    }
    
    protected onComputeID(): string {
        return `inputDialog[${this.bindingPath()}]`;
    }

    protected onInstallDependencies(): void {
        if (this.stepsBefore) {
            this.stepsBefore.forEach((step) => this.addDialog(step));
        }
        this.slots.forEach((slot) => {
            if (typeof (slot as any).getDependencies == 'function') {
                const steps = (slot as any).getDependencies();
                steps.forEach((step) => this.addDialog(step));
            }
        });
        this.prompts.forEach((prompt) => prompt.steps.forEach((step) => this.addDialog(step)));
        if (this.stepsAfter) {
            this.stepsAfter.forEach((step) => this.addDialog(step));
        }
        super.onInstallDependencies();
    }

    protected async onEndOfPlan(planning: PlanningContext): Promise<DialogTurnResult> {
        // Are all required fields satisfied?
        const state = planning.activeDialog.state as InputDialogState<O>;
        if (state.satisfied) {
            // Return result
            return await planning.endDialog(state.result);
        } else {
            return Dialog.EndOfTurn;
        }
    }

    protected async recognizeInput(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        // TODO
        return false;

    }

    protected async validateValues(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        // TODO
        return false;
    }

    protected async queuePrompt(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        // TODO
        return false;
    }

    /**
     * Computes a list of plan changes to apply for a given set of tags.
     * 
     * @remarks
     * The computation can potentially be expensive so the results of a computation are cached such that
     * future requests for the same exact set of tags will be returned from the cache. 
     * 
     * The algorithm first filters the dialogs prompts to a list of prompts matching the combined set of 
     * tags passed in.  It then will begin searching for the list of changes that should be applied.
     * 
     * The algorithm wants to first show the best prompt that matches the set of `priorityTags`. The
     * algorithm will keep appending plan changes until as many of the priority tags as possible are
     * covered. If, however, it ever renders a prompt that also covers any `missingSlots` it will end 
     * and return the changes up to that point. That's because the algorithm never wants to prompt the
     * user for missing information more than once.
     * 
     * Once all of the `priorityTags` have been appended to the change list, the algorithm will search
     * for the prompt that covers the most `missingSlots`. It will then append that prompts plan 
     * changes, cache the results, and then return.
     * 
     * The list of `otherTags` passed in represents other tags in scope for the current dialog. These 
     * tags are only used to calculate the cache key and filter the initial set of candidate prompts.      
     * @param priorityTags List of tags that should be rendered first. These tags represent slots that have been set, changed, or removed.
     * @param missingSlots List of tags for slots that are still missing.
     * @param otherTags Additional tags that are currently in scope for the dialog.
     */
    protected computePlanChanges(priorityTags: string[], missingSlots: string[], otherTags: string[]): InputDialogComputedPlanChange {
        // Check cache first
        const filterTags = priorityTags.concat(missingSlots, otherTags);        
        const key = filterTags.join('.');
        if (this.planChangeCache.hasOwnProperty(key)) {
            return this.planChangeCache[key];
        }

        // Filter prompts to eligible prompts
        const prompts = this.prompts.filter((prompt) => this.promptMatchesFilter(prompt, filterTags));

        // Compute changes
        let done = false;
        let lastPrompt: InputDialogPrompt;
        const change: InputDialogComputedPlanChange = {
            changes: [],
            expectedSlots: []
        }
        while (!done && prompts.length > 0) {
            if (priorityTags.length > 0) {
                // Find best fitting priority prompts
                const index = this.findBestFit(prompts, priorityTags);
                if (index >= 0) {
                    // Does prompt cover any missing slots?
                    const prompt = prompts[index];
                    if (this.countMatchingTags(prompt.tagSelector, missingSlots)) {
                        // Is there already a last prompt?
                        if (lastPrompt != undefined) {
                            // Remove prompt from list and continue
                            prompts.splice(index, 1);
                            continue;
                        }

                        // Save this prompt to be used as the last prompt 
                        lastPrompt = prompt;
                    } else {
                        // Queue plan change
                        change.changes.push(this.createChangeList(prompt.steps));
                    }

                    // Remove prompt from list so that it can't be reused
                    prompts.splice(index, 1);

                    // Remove priority tags from tag list so they can't be reused
                    priorityTags = priorityTags.filter((tag) => prompt.tagSelector.indexOf(tag) < 0);
                } else {
                    priorityTags = [];
                }
            } else if (lastPrompt) {
                // Queue plan change
                change.changes.push(this.createChangeList(lastPrompt.steps));

                // Update expected slots
                change.expectedSlots = missingSlots.filter((slot) => lastPrompt.tagSelector.indexOf(slot) >= 0);

                done = true;
            } else {
                // Find best fitting missing slot prompt
                const index = this.findBestFit(prompts, missingSlots);
                if (index >= 0) {
                    // Queue plan change
                    const prompt = prompts[index];
                    change.changes.push(this.createChangeList(prompt.steps));

                    // Update expected slots
                    change.expectedSlots = missingSlots.filter((slot) => prompt.tagSelector.indexOf(slot) >= 0);
                }

                done = true;
            }
        }

        // Post process expected slots
        // - checks for "invalid(slot)" tag and returns just the "slot"
        change.expectedSlots = change.expectedSlots.map((tag) => {
            const matched = /\w*\((.*)\)/.exec(tag);
            return matched ? matched[1] : tag
        });

        // Cache changes before returning
        this.planChangeCache[key] = change;
        return change;
    }

    private promptMatchesFilter(prompt: InputDialogPrompt, filterTags: string[]): boolean {
        // Ensure the prompts tags all match the filter
        const matched = this.countMatchingTags(prompt.tagSelector, filterTags);
        return matched == prompt.tagSelector.length;
    }

    private findBestFit(prompts: InputDialogPrompt[], filterTags: string[]): number {
        let bestCnt = 0;
        let bestPos = -1;
        for (let i = 0; i < prompts.length; i++) {
            // Does prompt have more tags that match the filterTags?
            const prompt = prompts[i];
            const cnt = this.countMatchingTags(prompt.tagSelector, filterTags);
            if (cnt > bestCnt) {
                bestCnt = cnt;
                bestPos = i;
            }
        }

        return bestPos;
    }

    private countMatchingTags(a: string[], b: string[]): number {
        const filtered = a.length > b.length ? b.filter((t) => a.indexOf(t) >= 0) : a.filter((t) => b.indexOf(t) >= 0);
        return filtered.length;
    }

    private queueSteps(planning: PlanningContext, steps?: Dialog[], options?: any): boolean {
        if (steps) {
            // Queue up changes
            const changes = this.createChangeList(steps, options);
            planning.queueChanges(changes);
            return true;
        }

        return false;
    }

    private createChangeList(steps: Dialog[], options?: any): PlanChangeList {
        const changes: PlanChangeList = { changeType: PlanChangeType.doSteps, steps: [] };
        steps.forEach((step) => {
            const ss: PlanStepState = { dialogStack: [], dialogId: step.id };
            if (options) { ss.options = options }
            changes.steps.push(ss);
        });

        return changes;
    }
}

interface InputDialogState<O extends object> extends PlanningState<O> {
    turnCount: number;
    satisfied?: boolean;
}
