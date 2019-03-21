/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, DialogCommand } from 'botbuilder-dialogs';

export interface SetPropertyConfiguration extends DialogConfiguration {
    /**
     * The expression to evaluate.
     */
    expression?: string;
}

export class SetProperty<O extends object = {}> extends DialogCommand<O> {

    /**
     * Creates a new `CallDialog` instance.
     * @param expression (Optional) expression to evaluate.
     */
    constructor(expression?: string) {
        super();
        if (expression) { this.expression = expression }
    }

    protected onComputeID(): string {
        return `setProperty[${this.hashedLabel(this.expression)}]`;
    }

    public configure(config: SetPropertyConfiguration): this {
        return super.configure(config);
    }

    /**
     * The expression to evaluate.
     */
    public expression: string;

    public async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        // Parse expression
        const parts = this.expression.split('=');
        if (parts.length !== 2) { throw new Error(`SetProperty: invalid expression of "${this.expression}".`) }
        const left = parts[0].trim();
        const right = parts[1].trim();

        // Is right hand value a memory reference
        const prefixes = ['user.', 'conversation.', 'dialog.', 'turn.', '$.', '$', '#', '@'];
        for (let i = 0; i < prefixes.length; i++) {
            const prefix = prefixes[i];
            if (right.indexOf(prefix) == 0) {
                // Perform memory to memory copy.
                const value = dc.state.getValue(right);
                dc.state.setValue(left, value);
                return await dc.endDialog();
            }
        }

        // Perform static value assignment
        const quoted = right.split("'");
        const value = quoted.length == 3 && quoted[0].length == 0 ?  quoted[1] : JSON.parse(right);
        dc.state.setValue(left, value);
        return await dc.endDialog();
    }
}