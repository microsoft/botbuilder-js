/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SequenceDialog } from './sequenceDialog';
import { StateTransitionRule } from './rules';
import { Dialog, DialogTurnResult, DialogEvent } from 'botbuilder-dialogs';
import { PlanningContext, PlanningEventNames, PlanStepState, PlanChangeType } from './planningContext';

export class StateMachineState extends SequenceDialog {
    private rule = new StateTransitionRule();

    public transitions: { [eventName: string]: string; } = {};

    constructor(stateName?: string, steps?: Dialog[]) {
        super(stateName, steps);
        this.addRule(this.rule);
    }

    public permit(eventName: string, state: string): this {
        this.transitions[eventName] = state;
        return this;
    }

    protected onInstallDependencies(): void {
        this.rule.transitions = this.transitions;
        this.rule.steps.forEach((step) => this.addDialog(step));
        super.onInstallDependencies();
    }

    protected async evaluateRules(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        // Intercept fallback event
        if (event.name == PlanningEventNames.fallback) {
            // Queue up sequences plan
            const steps = this.steps.map((step) => {
                return {
                    dialogStack: [],
                    dialogId: step.id,
                    options: event.value
                } as PlanStepState
            });
            planning.queueChanges({ changeType: PlanChangeType.doSteps, steps: steps });
            return true;
        } else {
            return await super.evaluateRules(planning, event);
        }
    }

    protected async onEndOfPlan(planning: PlanningContext): Promise<DialogTurnResult> {
        // Just wait
        return Dialog.EndOfTurn;
    }
}