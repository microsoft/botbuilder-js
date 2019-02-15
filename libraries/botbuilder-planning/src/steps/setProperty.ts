/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand } from '../dialogCommand';
import { DialogContext } from '../dialogContext';
import { DialogTurnResult, DialogConfiguration, Dialog } from '../dialog';
import { DialogContextState } from '../dialogContextState';

export class SetProperty extends DialogCommand {

    protected onComputeID(): string {
        return `setState(${this.expression.toString()})`;
    }

    public expression: (state: DialogContextState) => Promise<void>;

    protected async onRunCommand(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        await this.expression(dc.state);
        return await dc.endDialog();
    }

    static create(expression: (state: DialogContextState) => Promise<void>, config?: DialogConfiguration): SetProperty {
        const dialog = new SetProperty();
        dialog.expression = expression;
        if (config) {
            Dialog.configure(dialog, config);
        }
        return dialog;
    }
}