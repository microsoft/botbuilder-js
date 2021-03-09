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
import { TurnContext } from 'botbuilder';
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

interface CompatibleAdapter {
    getConversationMembers(context: TurnContext);
}

function isCompatibleAdapter(adapter: unknown): adapter is CompatibleAdapter {
    return adapter && typeof (adapter as CompatibleAdapter).getConversationMembers === 'function';
}

export interface GetConversationMembersConfiguration extends DialogConfiguration {
    property?: string | Expression | StringExpression;
    disabled?: boolean | string | Expression | BoolExpression;
}

/**
 * Calls `BotFrameworkAdapter.getConversationMembers()` and sets the result to a memory property.
 */
export class GetConversationMembers<O extends object = {}>
    extends Dialog<O>
    implements GetConversationMembersConfiguration {
    public static $kind = 'Microsoft.GetConversationMembers';

    public constructor();

    /**
     * Initializes a new instance of the [GetConversationMembers](xref:botbuilder-dialogs-adaptive.GetConversationMembers) class.
     * @param property Property path to put the value in.
     */
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

    public getConverter(property: keyof GetConversationMembersConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'property':
                return new StringExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
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

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `GetConversationMembers[${this.property.toString()}]`;
    }
}
