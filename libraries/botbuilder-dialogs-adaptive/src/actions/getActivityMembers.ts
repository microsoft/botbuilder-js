/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
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
import { BotFrameworkAdapter, TurnContext } from 'botbuilder';
import { ConnectorClient } from 'botframework-connector';

export interface GetActivityMembersConfiguration extends DialogConfiguration {
    activityId?: StringProperty;
    property?: StringProperty;
    disabled?: BoolProperty;
}

/**
 * Calls `BotFrameworkAdapter.getActivityMembers()` and sets the result to a memory property.
 */
export class GetActivityMembers<O extends object = {}> extends Dialog implements GetActivityMembersConfiguration {
    static $kind = 'Microsoft.GetActivityMembers';

    constructor();

    /**
     * Initializes a new instance of the [GetActivityMembers](xref:botbuilder-dialogs-adaptive.GetActivityMembers) class.
     *
     * @param activityId Optional. The expression to get the value to put into property path.
     * @param property Optional. Property path to put the value in.
     */
    constructor(activityId?: string, property?: string) {
        super();
        if (activityId) {
            this.activityId = new StringExpression(activityId);
        }
        if (property) {
            this.property = new StringExpression(property);
        }
    }

    /**
     * The expression to get the value to put into property path.
     */
    activityId: StringExpression;

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
    getConverter(property: keyof GetActivityMembersConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'activityId':
                return new StringExpressionConverter();
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

        let id = dc.context.activity.id;
        if (this.activityId) {
            const value = this.activityId.getValue(dc.state);
            id = value.toString();
        }

        const result = await this.getActivityMembers(dc.context, id);
        dc.state.setValue(this.property.getValue(dc.state), result);
        return await dc.endDialog(result);
    }

    private async getActivityMembers(context: TurnContext, activityId: string) {
        // If no activity was passed in, use the current activity.
        if (!activityId) {
            activityId = context.activity.id;
        }

        if (!context.activity.conversation) {
            throw new Error('[GetActivityMembers]: Missing conversation');
        }
        const conversationId = context.activity.conversation.id;

        if (!conversationId || conversationId.trim() === '') {
            throw new Error('[GetActivityMembers]: Missing conversation.id');
        }

        const connectorClient = this.getConnectorClient(context);
        const accounts = await connectorClient.conversations.getActivityMembers(conversationId, activityId);
        return accounts;
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
        return `GetActivityMembers[${this.activityId ? this.activityId.toString() : ''}, ${
            this.property ? this.property.toString() : ''
        }]`;
    }
}
