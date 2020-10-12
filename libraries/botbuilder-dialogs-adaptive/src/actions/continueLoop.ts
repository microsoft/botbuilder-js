/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolExpression, BoolExpressionConverter } from 'adaptive-expressions';
import { Converter, ConverterFactory, Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { NonFunctionKeys } from 'utility-types';
import { ActionScopeResult, ActionScopeCommands } from './actionScope';

export class ContinueLoop<O extends object = {}> extends Dialog<O> {
    public static $kind = 'Microsoft.ContinueLoop';

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: NonFunctionKeys<ContinueLoop>): Converter | ConverterFactory {
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

        const actionScopeResult: ActionScopeResult = {
            actionScopeCommand: ActionScopeCommands.ContinueLoop,
        };

        return await dc.endDialog(actionScopeResult);
    }

    protected onComputeId(): string {
        return `ContinueLoop[]`;
    }
}
