/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext, DialogContextState, DialogConfiguration } from 'botbuilder-dialogs';

export interface SetPropertyConfiguration extends DialogConfiguration {
    expression?: (state: DialogContextState) => Promise<void>;
}

export class SetProperty extends DialogCommand {

    /**
     * 
     * @param expression 
     */
    constructor();
    constructor(expression: (state: DialogContextState) => Promise<void>);
    constructor(expression?: (state: DialogContextState) => Promise<void>) {
        super();
        if (expression) { this.expression = expression }
    }

    protected onComputeID(): string {
        return `set[${this.hashedLabel(this.expression.toString())}]`;
    }

    public expression: (state: DialogContextState) => Promise<void>;

    public configure(config: SetPropertyConfiguration): this {
        return super.configure(config);
    }
    
    protected async onRunCommand(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        await this.expression(dc.state);
        return await dc.endDialog();
    }
}