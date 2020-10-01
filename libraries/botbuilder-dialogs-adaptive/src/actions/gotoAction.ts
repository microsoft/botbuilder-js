/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StringExpression, BoolExpression, BoolExpressionConverter, StringExpressionConverter } from 'adaptive-expressions';
import { Converters, DialogTurnResult, Dialog, DialogContext } from 'botbuilder-dialogs';
import { ActionScopeResult, ActionScopeCommands } from './actionScope';

export class GotoAction<O extends object = {}> extends Dialog<O> {
    public static $kind = 'Microsoft.GotoAction';

    public constructor();
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

    public converters: Converters<GotoAction> = {
        actionId: new StringExpressionConverter(),
        disabled: new BoolExpressionConverter()
    };

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

    protected onComputeId(): string {
        return `GotoAction[${ this.actionId.toString() }]`;
    }
}