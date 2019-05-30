/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogEvent } from 'botbuilder-dialogs';
import { SequenceContext, StepChangeList, StepChangeType, StepState } from '../sequenceContext';
import { Rule } from './rule';

/**
 * This rule is triggered when a dialog event matching a list of event names is emitted.
 */
export class EventRule implements Rule {
    // If `true`, the rule should be triggered on the leading edge of the event. 
    public readonly preBubble: boolean;

    /**
     * List of events to filter to.
     */
    public readonly events: string[];

    /**
     * List of steps to update the plan with when triggered.
     */
    public readonly steps: Dialog[];

    /**
     * Creates a new `EventRule` instance.
     * @param events (Optional) list of events to filter to.
     * @param steps (Optional) list of steps to update the plan with when triggered.
     * @param preBubble (Optional) flag controlling whether the rule triggers on the leading or trailing edge of the event. Defaults to a value of `true`.
     */
    constructor(events?: string|string[], steps?: Dialog[], preBubble?: boolean) {
        this.events = Array.isArray(events) ? events : (events !== undefined ? [events] : []);
        this.steps = steps || [];
        this.preBubble = preBubble !== undefined ? preBubble : true;
    }

    public evaluate(sequence: SequenceContext, event: DialogEvent, preBubble: boolean): Promise<StepChangeList[]|undefined> {
        // Limit evaluation to only supported events
        if (preBubble == this.preBubble && this.events.indexOf(event.name) >= 0) {
            return this.onEvaluate(sequence, event);
        } else {
            return undefined;
        }
    }

    protected async onEvaluate(sequence: SequenceContext, event: DialogEvent): Promise<StepChangeList[]|undefined> {
        if (await this.onIsTriggered(sequence, event)) {
            return [this.onCreateChangeList(sequence, event)];
        }
    }

    protected async onIsTriggered(sequence: SequenceContext, event: DialogEvent): Promise<boolean> {
        return true;
    }

    protected onCreateChangeList(sequence: SequenceContext, event: DialogEvent, dialogOptions?: any): StepChangeList {
        const changeList: StepChangeList = { changeType: StepChangeType.insertSteps, steps: [] };
        this.steps.forEach((step) => {
            const stepState: StepState = { dialogStack: [], dialogId: step.id };
            if (dialogOptions !== undefined) {
                stepState.options = dialogOptions;
            }
            changeList.steps.push(stepState);
        });

        return changeList;
    }
}