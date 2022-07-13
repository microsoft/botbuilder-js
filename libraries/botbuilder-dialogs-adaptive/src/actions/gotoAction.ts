/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActionScopeResult, ActionScopeCommands } from './actionScope';
import { BoolProperty, StringProperty } from '../properties';

import {
    BoolExpression,
    BoolExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export interface GotoActionConfiguration extends DialogConfiguration {
    actionId?: StringProperty;
    disabled?: BoolProperty;
}

/**
 * Goto an action by Id.
 */
export class GotoAction<O extends object = {}> extends Dialog<O> implements GotoActionConfiguration {
    static $kind = 'Microsoft.GotoAction';

    constructor();

    /**
     * Initializes a new instance of the [GotoAction](xref:botbuilder-dialogs-adaptive.GotoAction) class.
     *
     * @param actionId Optional. Action's unique identifier.
     */
    constructor(actionId?: string) {
        super();
        if (actionId) {
            this.actionId = new StringExpression(actionId);
        }
    }

    /**
     * The action id to go.
     */
    actionId: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof GotoActionConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'actionId':
                return new StringExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this.actionId) {
            throw new Error('Action id cannot be null.');
        }

        const actionScopeResult: ActionScopeResult = {
            actionScopeCommand: ActionScopeCommands.GotoAction,
            actionId: this.actionId.getValue(dc.state),
        };

        return await dc.endDialog(actionScopeResult);
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `GotoAction[${this.actionId.toString()}]`;
    }
}
