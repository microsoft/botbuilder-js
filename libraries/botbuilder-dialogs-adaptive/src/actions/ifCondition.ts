/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogConfiguration, DialogContext } from 'botbuilder-dialogs';
import { ExpressionPropertyValue, ExpressionProperty } from '../expressionProperty';
import { ActionScope } from './actionScope';

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
    private ifScope: ActionScope;
    private elseScope: ActionScope;

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
        const actions = this.actions.concat(this.elseActions);
        if (this.actions.length > 0) {
            this.ifScope = new ActionScope(this.actions);
            this.ifScope.id = 'True' + this.ifScope.id;
            actions.push(this.ifScope);
        }
        if (this.elseActions.length > 0) {
            this.elseScope = new ActionScope(this.elseActions);
            this.elseScope.id = 'False' + this.elseScope.id;
            actions.push(this.elseScope);
        }
        return actions;
    }

    public else(actions: Dialog[]): this {
        this.elseActions = actions;
        return this;
    }

    public async beginDialog(dc: DialogContext, options: object): Promise<DialogTurnResult> {
        // Evaluate condition
        if (!this.condition) { throw new Error(`${this.id}: no conditional expression specified.`) }
        const value = this.condition.evaluate(this.id, dc.state);

        // Check for truthy returned value
        const triggered = value ? this.ifScope : this.elseScope;
        if (triggered) {
            // Redirect to triggered actions
            return await dc.replaceDialog(triggered.id);
        } else {
            // End dialog since no triggered actions
            return await dc.endDialog();
        }
    }
}
