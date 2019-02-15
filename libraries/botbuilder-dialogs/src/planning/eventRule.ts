/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from '../dialog';
import { PlanningContext, PlanChangeList, PlanChangeType, PlanChange } from './planningContext';
import { PlanningRule } from './planningRule';

export class EventRule implements PlanningRule {
    public readonly changes: { type: PlanChangeType; step?: Dialog; title?: string; tags?: string[]; }[] = [];

    public readonly steps: Dialog[] = [];

    public readonly events: string[];

    public tags: string;

    public enableSelector: string;

    public disableSelector: string;

    constructor(events?: string|string[]) {
        this.events = Array.isArray(events) ? events : (events !== undefined ? [events] : []);
    }

    public addTags(tags: string): this {
        this.tags = tags;
        this.steps.forEach((step) => step.addTags(tags));
        return this;
    }

    public beginPlan(title?: string): this {
        this.changes.push({
            type: PlanChangeType.beginPlan,
            title: title
        });
        return this;
    }

    public doSteps(...steps: Dialog[]): this {
        steps.forEach(step => {
            step.addTags(this.tags);
            this.steps.push(step);
            this.changes.push({
                type: PlanChangeType.doSteps,
                step: step 
            });
        });
        return this;
    }

    public doStepsBeforeTags(tags: string|string[], ...steps: Dialog[]): this {
        steps.forEach(step => {
            step.addTags(this.tags);
            this.steps.push(step);
            this.changes.push({
                type: PlanChangeType.doStepsBeforeTags,
                step: step,
                tags: Array.isArray(tags) ? tags : [tags]
            });
        });
        return this;
    }

    public doStepsLater(...steps: Dialog[]): this {
        steps.forEach(step => {
            step.addTags(this.tags);
            this.steps.push(step);
            this.changes.push({
                type: PlanChangeType.doStepsLater,
                step: step 
            });
        });
        return this;
    }

    public endPlan(): this {
        this.changes.push({ type: PlanChangeType.endPlan });
        return this;
    }

    public enableIf(selector: string): this {
        this.enableSelector = selector;
        return this;
    }

    public disableIf(selector: string): this {
        this.disableSelector = selector;
        return this;
    }

    public evaluate(planning: PlanningContext): Promise<PlanChangeList[]|undefined> {
        // Limit evaluation to only supported events
        if (this.events.indexOf(planning.eventName) >= 0) {
            return this.onEvaluate(planning);
        } else {
            return undefined;
        }
    }

    protected async onEvaluate(planning: PlanningContext): Promise<PlanChangeList[]|undefined> {
        if (await this.onIsTriggered(planning)) {
            return [this.onCreateChangeList(planning)];
        }
    }

    protected async onIsTriggered(planning: PlanningContext): Promise<boolean> {
        let addedTags: string[] = [];
        if (planning.plan && planning.plan.steps.length > 0) {
            addedTags.push('planActive');
            const dialog = planning.findDialog(planning.plan.steps[0].dialogId);
            if (dialog) {
                dialog.tags.forEach((tag) => addedTags.push(tag));
            }
        }
        if (!this.enableSelector || planning.tagSelectorMatched(this.enableSelector, addedTags)) {
            if (!this.disableSelector || !planning.tagSelectorMatched(this.disableSelector, addedTags)) {
                return true;
            }
        }
        return false;
    }

    protected onCreateChangeList(planning: PlanningContext, dialogOptions?: any): PlanChangeList {
        const changeList: PlanChangeList = { changes: [] };
        this.changes.forEach((change) => {
            const planChange: PlanChange = { type: change.type };
            if (change.step) {
                planChange.dialogId = change.step.id;
                if (dialogOptions) {
                    planChange.dialogOptions = dialogOptions;
                }
            }
            if (change.title) {
                planChange.title = change.title;
            }
            if (change.tags) {
                planChange.tags = change.tags;
            }
            changeList.changes.push(planChange);
        });

        return changeList;
    }
}