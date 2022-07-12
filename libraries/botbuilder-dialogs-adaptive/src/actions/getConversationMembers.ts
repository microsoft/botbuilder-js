/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import type { BotFrameworkAdapter, TurnContext } from 'botbuilder';
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
import { ConnectorClient } from 'botframework-connector';

export interface GetConversationMembersConfiguration extends DialogConfiguration {
    property?: StringProperty;
    disabled?: BoolProperty;
}

/**
 * Calls `BotFrameworkAdapter.getConversationMembers()` and sets the result to a memory property.
 */
export class GetConversationMembers<O extends object = {}>
    extends Dialog<O>
    implements GetConversationMembersConfiguration {
    static $kind = 'Microsoft.GetConversationMembers';

    constructor();

    /**
     * Initializes a new instance of the [GetConversationMembers](xref:botbuilder-dialogs-adaptive.GetConversationMembers) class.
     *
     * @param property Property path to put the value in.
     */
    constructor(property?: string) {
        super();
        if (property) {
            this.property = new StringExpression(property);
        }
    }

    /**
     * Property path to put the value in.
     */
    property: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof GetConversationMembersConfiguration): Converter | ConverterFactory {
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
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }
        const result = await this.getMembers(dc.context);
        dc.state.setValue(this.property.getValue(dc.state), result);
        return await dc.endDialog(result);
    }

    private async getMembers(context: TurnContext) {
        const conversationId = context.activity?.conversation?.id;
        if (!conversationId) {
            throw new Error('[GetConversationMembers]: The getMembers operation needs a valid conversation id.');
        }

        const connectorClient = this.getConnectorClient(context);
        const teamMembers = await connectorClient.conversations.getConversationMembers(conversationId);
        return teamMembers;
    }

    private getConnectorClient(context: TurnContext): ConnectorClient {
        const client =
            context.adapter && 'createConnectorClient' in context.adapter
                ? (context.adapter as BotFrameworkAdapter).createConnectorClient(context.activity.serviceUrl)
                : context.turnState?.get<ConnectorClient>(context.adapter.ConnectorClientKey);
        if (!client) {
            throw new Error('This method requires a connector client.');
        }

        return client;
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
