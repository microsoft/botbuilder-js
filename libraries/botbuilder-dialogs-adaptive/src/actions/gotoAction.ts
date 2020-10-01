/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext } from 'botbuilder-dialogs';
import { ActionScopeResult, ActionScopeCommands } from './actionScope';
import { StringExpression, BoolExpression } from 'adaptive-expressions';

/**
 * Goto an action by Id.
 */
export class GotoAction<O extends object = {}> extends Dialog<O> {
    public constructor();

    /**
     * Initializes a new instance of the `GotoAction` class.
     * @param actionId Optional. Action's unique identifier.
     */
    public constructor(actionId?: string) {
        super();
        if (actionId) { this.actionId = new StringExpression(actionId); }
    }

    /**
     * The action id to go.
     */
    public actionId: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Starts a new dialog and pushes it onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param result Optional. Value returned from the dialog that was called. The type 
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this.actionId) {
            throw new Error(`Action id cannot be null.`);
        }

        const actionScopeResult: ActionScopeResult = {
            actionScopeCommand: ActionScopeCommands.GotoAction,
            actionId: this.actionId.getValue(dc.state)
        };

        return await dc.endDialog(actionScopeResult);
    }

    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `GotoAction[${ this.actionId.toString() }]`;
    }
}
