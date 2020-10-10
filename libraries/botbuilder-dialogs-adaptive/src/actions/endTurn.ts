/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityTypes } from 'botbuilder-core';
import { Converters, DialogTurnResult, Dialog, DialogContext, Properties } from 'botbuilder-dialogs';
import { BoolExpression, BoolExpressionConverter } from 'adaptive-expressions';

export class EndTurn<O extends object = {}> extends Dialog<O> {
    public static $kind = 'Microsoft.EndTurn';

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public get converters(): Converters<Properties<EndTurn>> {
        return {
            disabled: new BoolExpressionConverter(),
        };
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }
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
