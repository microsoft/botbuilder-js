/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AdaptiveDialog } from './adaptiveDialog';
import { StateTransitionRule, UnknownIntentRule } from './rules';
import { Dialog } from 'botbuilder-dialogs';

export class StateMachineState extends AdaptiveDialog {
    private rule = new StateTransitionRule();

    public transitions: { [eventName: string]: string; } = {};

    constructor(stateName?: string, steps?: Dialog[]) {
        super(stateName);
        this.addRule(new UnknownIntentRule(steps));
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

}