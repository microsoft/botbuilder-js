/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from '../dialog';
import { PlanningContext, PlanChangeList } from './planningContext';
import { PlanningRule } from './planningRule';
import { DialogContextState } from '../dialogContextState';

export class IfPropertyRule implements PlanningRule {
    public rules: PlanningRule[] = [];

    constructor(protected readonly expression: (state: DialogContextState) => Promise<boolean>) {

    }

    public get steps(): Dialog[] {
        const steps: Dialog[] = [];
        this.rules.forEach((rule) => rule.steps.forEach((step) => steps.push(step)));
        return steps;
    }

    public addRule(...rules: PlanningRule[]): this {
        rules.forEach((rule) => this.rules.push(rule));
        return this;
    }

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
        return await this.expression(planning.state);
    }
}