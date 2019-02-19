/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, Dialog, DialogCommand, DialogContext, DialogContextState } from 'botbuilder-dialogs';

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
        return `setProperty(${this.expression.toString()})`;
    }

    public expression: (state: DialogContextState) => Promise<void>;

    protected async onRunCommand(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        await this.expression(dc.state);
        return await dc.endDialog();
    }
}