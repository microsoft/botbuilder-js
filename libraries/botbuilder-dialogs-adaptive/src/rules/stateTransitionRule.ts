/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogEvent } from 'botbuilder-dialogs';
import { PlanningContext, PlanChangeList, PlanChangeType } from '../planningContext';
import { PlanningRule } from './planningRule';
import { ReplaceDialog } from '../steps';

/**
 * This rule is triggered when a dialog event matching a list of event names is emitted.
 */
export class StateTransitionRule implements PlanningRule {
    private _steps: { [state: string]: Dialog; } = {};

    /**
     * Map of state transitions allowed.
     */
    public transitions: { [eventName: string]: string; };

    /**
     * Creates a new `StateTransitionRule` instance.
     * @param transitions (Optional) map of state transitions allowed.
     */
    constructor(transitions?: { [eventName: string]: string; }) {
        this.transitions = transitions || {};
    }

    public get steps(): Dialog[] {
        // Return a new GotoDialog for each transition
        const steps: Dialog[] = [];
        for(const eventName in this.transitions) {
            const state = this.transitions[eventName];
            if (!this._steps.hasOwnProperty(state)) {
                const step = new ReplaceDialog(state);
                step.id = `stateTransition[${state}]`;
                this._steps[state] = step;
                steps.push(step);
            }
        }

        return steps;
    }

    public async evaluate(planning: PlanningContext, event: DialogEvent, memory: object): Promise<PlanChangeList[]|undefined> {
        // Look for state changes
        if (this.transitions.hasOwnProperty(event.name)) {
            const state = this.transitions[event.name];
            const step = this._steps[state];
            return [{
                changeType: PlanChangeType.doSteps,
                steps: [
                    { dialogStack: [], dialogId: step.id, options: event.value }
                ]
            }];
        } else {
            return undefined;
        }
    }
}