/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { SequenceContext, ActionState, ActionChangeType } from '../sequenceContext';
import { ExpressionPropertyValue, ExpressionProperty } from '../expressionProperty';

export interface IfConditionConfiguration extends DialogConfiguration {
    /**
     * The conditional expression to evaluate.
     */
    condition?: ExpressionPropertyValue<boolean>;

    /**
     * The actions to run if [condition](#condition) returns true.
     */
    actions?: Dialog[];

    /**
     * The actions to run if [condition](#condition) returns false.
     */
    elseActions?: Dialog[];
}

export class IfCondition extends Dialog {
    /**
     * The conditional expression to evaluate.
     */
    public condition: ExpressionProperty<boolean>;

    /**
     * The actions to run if [condition](#condition) returns true.
     */
    public actions: Dialog[] = [];

    /**
     * The actions to run if [condition](#condition) returns false.
     */
    public elseActions: Dialog[] = [];

    /**
     * Creates a new `IfCondition` instance.
     * @param condition The conditional expression to evaluate.
     * @param actions The actions to run if the condition returns true.
     */
    constructor(condition?: ExpressionPropertyValue<boolean>, actions?: Dialog[]) {
        super();
        if (condition) { this.condition = new ExpressionProperty(condition) }
        if (Array.isArray(actions)) { this.actions = actions }
    }

    protected onComputeId(): string {
        const label = this.condition ? this.condition.toString() : '';
        return `If[${label}]`;
    }

    public configure(config: IfConditionConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch(key) {
                    case 'condition':
                        this.condition = new ExpressionProperty(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    public getDependencies(): Dialog[] {
        return this.actions.concat(this.elseActions);
    }

    public else(actions: Dialog[]): this {
        this.elseActions = actions;
        return this;
    }

    public async beginDialog(sequence: SequenceContext, options: object): Promise<DialogTurnResult> {
        // Ensure planning context and condition
        if (!(sequence instanceof SequenceContext)) { throw new Error(`${this.id}: should only be used within an AdaptiveDialog.`) }
        if (!this.condition) { throw new Error(`${this.id}: no conditional expression specified.`) }

        // Evaluate expression
        const memory = sequence.state;
        const value = this.condition.evaluate(this.id, memory);

        // Check for truthy returned value
        const triggered = value ? this.actions : this.elseActions;

        // Queue up actions that should run after current action
        if (triggered.length > 0) {
            const actions = triggered.map((action) => {
                return {
                    dialogStack: [],
                    dialogId: action.id,
                    options: options
                } as ActionState
            });
            await sequence.queueChanges({ changeType: ActionChangeType.insertActions, actions: actions });
        }

        return await sequence.endDialog();
    }
}
