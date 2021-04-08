/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActionScopeResult, ActionScopeCommands } from './actionScope';
import { BoolExpression, BoolExpressionConverter } from 'adaptive-expressions';
import { BoolProperty } from '../properties';

import {
    Converter,
    ConverterFactory,
    DialogTurnResult,
    Dialog,
    DialogContext,
    DialogConfiguration,
} from 'botbuilder-dialogs';

export interface BreakLoopConfiguration extends DialogConfiguration {
    disabled?: BoolProperty;
}

/**
 * Break out of a loop.
 */
export class BreakLoop<O extends object = {}> extends Dialog<O> implements BreakLoopConfiguration {
    public static $kind = 'Microsoft.BreakLoop';

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: keyof BreakLoopConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is started and pushed onto the dialog stack.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        const actionScopeResult: ActionScopeResult = {
            actionScopeCommand: ActionScopeCommands.BreakLoop,
        };

        return await dc.endDialog(actionScopeResult);
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `BreakLoop[]`;
    }
}
