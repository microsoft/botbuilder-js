/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolExpression, BoolExpressionConverter } from 'adaptive-expressions';
import { ActivityTypes } from 'botbuilder-core';
import { Converter, ConverterFactory, Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { NonFunctionKeys } from 'utility-types';

export class EndTurn<O extends object = {}> extends Dialog<O> {
    public static $kind = 'Microsoft.EndTurn';

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: NonFunctionKeys<EndTurn>): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
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
