/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, DialogCommand, DialogContextState, DialogContextVisibleState } from 'botbuilder-dialogs';
import { ExpressionEngine } from 'botbuilder-expression-parser';
import { Expression } from 'botbuilder-expression';

export interface SetPropertyConfiguration extends DialogConfiguration {
    /**
     * The value expression to evaluate.
     */
    value?: string;
}

export type ExpressionDelegate<T> = (state: DialogContextVisibleState) => T;

export class SetProperty<O extends object = {}> extends DialogCommand<O> {
    /**
     * The value expression to evaluate.
     */
    public value: Expression;

    /**
     * Creates a new `SetProperty` instance.
     * @param value (Optional) value expression to evaluate.
     */
    constructor(value?: string|Expression|ExpressionDelegate<any>) {
        super();
        if (value) { 
            switch (typeof value) {
                case 'string':
                    this.value = engine.parse(value);
                    break; 
                case 'function':
                    this.value = Expression.Lambda(value);
                    break;
                default:
                    this.value = value as Expression;
                    break;
            }
        }
    }

    protected onComputeID(): string {
        const label = this.value ? this.value.toString() : '';
        return `setProperty[${this.hashedLabel(label)}]`;
    }

    public configure(config: SetPropertyConfiguration): this {
        const cfg: SetPropertyConfiguration = {};
        for (const key in config) {
            switch(key) {
                case 'value':
                    this.value = engine.parse(config.value);
                    break;
                default:
                    cfg[key] = config[key];
                    break;
            }
        }
        return super.configure(cfg);
    }

    public async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        // Ensure planning context and condition
        if (!this.value) { throw new Error(`${this.id}: no value expression specified.`) }

        // Evaluate expression
        const memory = dc.state.toJSON();
        const { error } = this.value.tryEvaluate(memory);

        // Check for error
        if (error) { throw new Error(`${this.id}: expression error - ${error.toString()}`) }

        return await dc.endDialog();
    }
}

const engine = new ExpressionEngine();