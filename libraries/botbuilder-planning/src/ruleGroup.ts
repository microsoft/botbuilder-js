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

export class RuleGroup implements PlanningRule {
    public rules: PlanningRule[] = [];

    public enableSelector: string;

    public disableSelector: string;

    public get steps(): Dialog[] {
        const steps: Dialog[] = [];
        this.rules.forEach((rule) => rule.steps.forEach((step) => steps.push(step)));
        return steps;
    }

    public addRule(...rules: PlanningRule[]): this {
        rules.forEach((rule) => this.rules.push(rule));
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
h
    public async evaluate(planning: PlanningContext): Promise<PlanChangeList[]|undefined> {
        const changes: PlanChangeList[] = [];
        if (await this.onIsTriggered(planning)) {
            // Evaluate child rules
            for (let i = 0; i < this.rules.length; i++) {
                const change = await this.rules[i].evaluate(planning);
                if (change) {
                    Array.prototype.push.apply(changes, change);
                }
            }
        }
        return changes.length > 0 ? changes : undefined;
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
}