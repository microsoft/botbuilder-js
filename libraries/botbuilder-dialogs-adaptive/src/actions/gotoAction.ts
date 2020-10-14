/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
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
import { ActionScopeResult, ActionScopeCommands } from './actionScope';

export interface GotoActionConfiguration extends DialogConfiguration {
    actionId?: string | Expression | StringExpression;
    disabled?: boolean | string | Expression | BoolExpression;
}

export class GotoAction<O extends object = {}> extends Dialog<O> implements GotoActionConfiguration {
    public static $kind = 'Microsoft.GotoAction';

    public constructor();
    public constructor(actionId?: string) {
        super();
        if (actionId) {
            this.actionId = new StringExpression(actionId);
        }
    }

    /**
     * The action id to go.
     */
    public actionId: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: keyof GotoActionConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'actionId':
                return new StringExpressionConverter();
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

        if (!this.actionId) {
            throw new Error(`Action id cannot be null.`);
        }

        const actionScopeResult: ActionScopeResult = {
            actionScopeCommand: ActionScopeCommands.GotoAction,
            actionId: this.actionId.getValue(dc.state),
        };

        return await dc.endDialog(actionScopeResult);
    }

    protected onComputeId(): string {
        return `GotoAction[${this.actionId.toString()}]`;
    }
}
