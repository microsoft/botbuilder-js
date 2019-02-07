/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from '../dialog';
import { PlanningContext, PlanChangeList, PlanChange, PlanChangeType } from './sequenceContext';
import { PlanningRule } from './sequenceRule';

export class EventRule implements PlanningRule {
    public readonly changes: { type: PlanChangeType, step?: Dialog, title?: string }[] = [];

    public readonly steps: Dialog[] = [];

    public readonly events: string[];

    public expression: (sequence: PlanningContext) => boolean;

    constructor(...events: string[]) {
        this.events = events;
    }

    public ifExpression(expression: (sequence: PlanningContext) => boolean): this {
        this.expression = expression;
        return this;
    }

    public beginSequence(title?: string): this {
        this.changes.push({
            type: PlanChangeType.beginPlan,
            title: title
        });
        return this;
    }

    public insertStepsBefore(...steps: Dialog[]): this {
        steps.reverse().forEach(step => {
            this.steps.push(step);
            this.changes.push({
                type: PlanChangeType.insertBeforeSteps,
                step: step 
            });
        });
        return this;
    }

    public appendStepsAfter(...steps: Dialog[]): this {
        steps.forEach(step => {
            this.steps.push(step);
            this.changes.push({
                type: PlanChangeType.appendAfterSteps,
                step: step 
            });
        });
        return this;
    }

    public endSequence(): this {
        this.changes.push({ type: PlanChangeType.endPlan });
        return this;
    }

    public evaluate(sequence: PlanningContext): Promise<PlanChangeList|undefined> {
        // Limit evaluation to only supported events
        if (this.events.indexOf(sequence.eventName) >= 0) {
            return this.onEvaluate(sequence);
        } else {
            return undefined;
        }
    }

    protected async onEvaluate(sequence: PlanningContext): Promise<PlanChangeList|undefined> {
    } 
}