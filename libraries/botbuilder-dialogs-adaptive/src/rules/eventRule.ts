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
     */
    constructor(events?: string|string[], steps?: Dialog[]) {
        this.events = Array.isArray(events) ? events : (events !== undefined ? [events] : []);
        this.steps = steps || [];
    }

    public evaluate(sequence: SequenceContext, event: DialogEvent, memory: object): Promise<StepChangeList[]|undefined> {
        // Limit evaluation to only supported events
        if (this.events.indexOf(event.name) >= 0) {
            return this.onEvaluate(sequence, event, memory);
        } else {
            return undefined;
        }
    }

    protected async onEvaluate(sequence: SequenceContext, event: DialogEvent, memory: object): Promise<StepChangeList[]|undefined> {
        if (await this.onIsTriggered(sequence, event, memory)) {
            return [this.onCreateChangeList(sequence, event)];
        }
    }

    protected async onIsTriggered(sequence: SequenceContext, event: DialogEvent, memory: object): Promise<boolean> {
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