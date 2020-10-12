/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    StringExpression,
    BoolExpression,
    BoolExpressionConverter,
    StringExpressionConverter,
} from 'adaptive-expressions';
import { Converter, ConverterFactory, Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { TurnContext } from 'botbuilder-core';
import { NonFunctionKeys } from 'utility-types';

interface CompatibleAdapter {
    getConversationMembers(context: TurnContext);
}

function isCompatibleAdapter(adapter: unknown): adapter is CompatibleAdapter {
    return adapter && typeof (adapter as CompatibleAdapter).getConversationMembers === 'function';
}

export class GetConversationMembers<O extends object = {}> extends Dialog<O> {
    public static $kind = 'Microsoft.GetConversationMembers';

    public constructor();
    public constructor(property?: string) {
        super();
        if (property) {
            this.property = new StringExpression(property);
        }
    }

    /**
     * Property path to put the value in.
     */
    public property: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: NonFunctionKeys<GetConversationMembers>): Converter | ConverterFactory {
        switch (property) {
            case 'property':
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

        const adapter = dc.context.adapter;
        if (isCompatibleAdapter(adapter)) {
            const result = await adapter.getConversationMembers(dc.context);
            dc.state.setValue(this.property.getValue(dc.state), result);
            return await dc.endDialog(result);
        } else {
            throw new Error('getConversationMembers() not supported by the current adapter.');
        }
    }

    protected onComputeId(): string {
        return `GetConversationMembers[${this.property.toString()}]`;
    }
}
