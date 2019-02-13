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

    public enableSelector: string;

    public disableSelector: string;

    constructor(events?: string|string[]) {
        this.events = Array.isArray(events) ? events : (events !== undefined ? [events] : []);
    }

    public beginPlan(title?: string): this {
        this.changes.push({
            type: PlanChangeType.beginPlan,
            title: title
        });
        return this;
    }

    public doNow(...steps: Dialog[]): this {
        steps.reverse().forEach(step => {
            this.steps.push(step);
            this.changes.push({
                type: PlanChangeType.doNow,
                step: step 
            });
        });
        return this;
    }

    public doBeforeTags(tags: string|string[], ...steps: Dialog[]): this {
        steps.reverse().forEach(step => {
            this.steps.push(step);
            this.changes.push({
                type: PlanChangeType.doBeforeTags,
                step: step,
                tags: Array.isArray(tags) ? tags : [tags]
            });
        });
        return this;
    }

    public doLater(...steps: Dialog[]): this {
        steps.forEach(step => {
            this.steps.push(step);
            this.changes.push({
                type: PlanChangeType.doLater,
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

    public evaluate(planning: PlanningContext): Promise<PlanChangeList|undefined> {
        // Limit evaluation to only supported events
        if (this.events.indexOf(planning.eventName) >= 0) {
            return this.onEvaluate(planning);
        } else {
            return undefined;
        }
    }

    protected async onEvaluate(planning: PlanningContext): Promise<PlanChangeList|undefined> {
        if (await this.onIsTriggered(planning)) {
            return this.onCreateChangeList(undefined);
        }
    }

    protected async onIsTriggered(planning: PlanningContext): Promise<boolean> {
        const addedTags = planning.plan && planning.plan.steps.length > 0 ? ['activePlan'] : [];
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