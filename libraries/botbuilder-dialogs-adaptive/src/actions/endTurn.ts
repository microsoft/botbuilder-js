/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext } from 'botbuilder-dialogs';
import { ActivityTypes } from 'botbuilder-core';

export class EndTurn<O extends object = {}> extends Dialog<O> {

    public static declarativeType = 'Microsoft.EndTurn';

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        return Dialog.EndOfTurn;
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        const activity = dc.context.activity;
        if (activity.type === ActivityTypes.Message) {
            return await dc.endDialog();
        } else {
            return Dialog.EndOfTurn;
        }
    }

    protected onComputeId(): string {
        return `EndTurn[]`;
    }
}