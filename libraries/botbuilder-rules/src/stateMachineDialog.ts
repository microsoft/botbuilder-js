/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogEvent, Dialog } from 'botbuilder-dialogs';
import { AdaptiveDialog } from './adaptiveDialog';
import { RuleDialogEventNames, PlanChangeType, PlanningContext } from './planningContext';
import { StateMachineState } from './stateMachineState';

export class StateMachineDialog extends AdaptiveDialog {
    public states: { [state: string]: StateMachineState; } = {};

    constructor (dialogId?: string, initialState?: string) {
        super(dialogId);
        if (initialState) { this.initialState = initialState }
    }

    public initialState: string;

    protected onComputeID(): string {
        return `stateMachine(${this.bindingPath()})`;
    }

    public addState(stateName: string, steps: Dialog[]): StateMachineState {
        if (this.states.hasOwnProperty(stateName)) { throw new Error(`StateMachineDialog.addState(): state named "${stateName}" already defined.`) }
        const state = new StateMachineState(stateName, steps);
        this.addDialog(state);
        this.states[stateName] = state;
        if (typeof this.initialState !== 'string') { this.initialState = stateName }
        return state;
    }

    public getState(stateName: string): StateMachineState {
        if (!this.states.hasOwnProperty(stateName)) { throw new Error(`StateMachineDialog.getState(): a state named "${stateName}" couldn't be found.`) }
        return this.states[stateName];
    }

    public async evaluateRules(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        // Intercept beginDialog event
        if (event.name == RuleDialogEventNames.beginDialog) {
            // Start dialog at initial state
            planning.queueChanges({ 
                changeType: PlanChangeType.doSteps, 
                steps: [
                    { dialogStack: [], dialogId: this.initialState, options: event.value }
                ] 
            });
            return true;
        } else {
            return await super.evaluateRules(planning, event);
        }
    }
}
