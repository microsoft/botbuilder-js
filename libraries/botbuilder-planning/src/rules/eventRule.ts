/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogEvent } from 'botbuilder-dialogs';
import { PlanningContext, PlanChangeList, PlanChangeType, PlanStepState } from '../planningContext';
import { PlanningRule } from './planningRule';

/**
 * This rule is triggered when a dialog event matching a list of event names is emitted.
 */
export class EventRule implements PlanningRule {

    /**
     * List of events to filter to.
     */
    public readonly events: string[];

    /**
     * List of steps to update the plan with when triggered.
     */
    public readonly steps: Dialog[];

    /**
     * Type of plan modification to make when triggered.
     */
    public changeType: PlanChangeType;

    /**
     * Creates a new `EventRule` instance.
     * @param events (Optional) list of events to filter to.
     * @param steps (Optional) list of steps to update the plan with when triggered.
     * @param changeType (Optional) type of plan modification to make when triggered. Defaults to `PlanChangeType.doSteps`.
     */
    constructor(events?: string|string[], steps?: Dialog[], changeType?: PlanChangeType) {
        this.events = Array.isArray(events) ? events : (events !== undefined ? [events] : []);
        this.steps = steps || [];
        this.changeType = changeType || PlanChangeType.doSteps;
    }

    public evaluate(planning: PlanningContext, event: DialogEvent): Promise<PlanChangeList[]|undefined> {
        // Limit evaluation to only supported events
        if (this.events.indexOf(event.name) >= 0) {
            return this.onEvaluate(planning, event);
        } else {
            return undefined;
        }
    }

    protected async onEvaluate(planning: PlanningContext, event: DialogEvent): Promise<PlanChangeList[]|undefined> {
        if (await this.onIsTriggered(planning, event)) {
            return [this.onCreateChangeList(planning, event)];
        }
    }

    protected async onIsTriggered(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        return true;
    }

    protected onCreateChangeList(planning: PlanningContext, event: DialogEvent, dialogOptions?: any): PlanChangeList {
        const changeList: PlanChangeList = { changeType: this.changeType, steps: [] };
        this.steps.forEach((step) => {
            const stepState: PlanStepState = { dialogStack: [], dialogId: step.id };
            if (dialogOptions !== undefined) {
                stepState.options = dialogOptions;
            }
            changeList.steps.push(stepState);
        });

        return changeList;
    }
}