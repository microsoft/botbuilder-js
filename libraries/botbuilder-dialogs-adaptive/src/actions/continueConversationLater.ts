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
    ValueExpression,
    ValueExpressionConverter,
} from 'adaptive-expressions';
import { Activity, ActivityEventNames, ActivityTypes, ConversationReference, QueueStorage, TurnContext } from 'botbuilder-core';
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
    DialogTurnStateConstants,
} from 'botbuilder-dialogs';

export interface ContinueConversationLaterConfiguration extends DialogConfiguration {
    disabled?: boolean | string | Expression | BoolExpression;
    date?: string | Expression | StringExpression;
    value?: unknown | ValueExpression;
}

/**
 * Action which schedules a conversation to be continued later by writing an EventActivity(Name=ContinueConversation) to a queue.
 */
export class ContinueConversationLater<O extends object = {}>
    extends Dialog<O>
    implements ContinueConversationLaterConfiguration {
    public static $kind = 'Microsoft.ContinueConversationLater';

    /**
     * Gets or sets an optional expression which if is true will disable this action.
     */
    public disabled: BoolExpression;

    /**
     * Gets or sets the expression which resolves to the date/time to continue the conversation.
     */
    public date: StringExpression;

    /**
     * Gets or sets the value to pass in the EventActivity payload.
     */
    public value: ValueExpression;

    public getConverter(property: keyof ContinueConversationLaterConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'date':
                return new StringExpressionConverter();
            case 'value':
                return new ValueExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is started and pushed onto the dialog stack.
     *
     * @param {DialogContext} dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param {object} options Optional. Initial information to pass to the dialog.
     * @returns {Promise<DialogTurnResult>} A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        const dateString = this.date.getValue(dc.state);
        const date = Date.parse(dateString);
        if (!date || isNaN(date)) {
            throw new Error('Date is invalid');
        }

        if (date <= Date.now()) {
            throw new Error('Date must be in the future');
        }

        // create ContinuationActivity from the conversation reference.
        const reference = TurnContext.getConversationReference(dc.context.activity);
        const activity: Partial<Activity> = TurnContext.applyConversationReference(
            {
                type: ActivityTypes.Event,
                name: ActivityEventNames.ContinueConversation,
                relatesTo: reference as ConversationReference,
            },
            reference,
            true
        );
        activity.value = this.value && this.value.getValue(dc.state);

        const visibility = (date - Date.now()) / 1000;
        const ttl = visibility + 2 * 60;

        const queueStorage: QueueStorage = dc.context.turnState.get(DialogTurnStateConstants.queueStorage);
        if (!queueStorage) {
            throw new Error('Unable to locate QueueStorage in HostContext');
        }

        const receipt = await queueStorage.queueActivity(activity, visibility, ttl);

        // return the receipt as the result.
        return await dc.endDialog(receipt);
    }

    /**
     * @protected
     * @returns {string} A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `ContinueConversationLater[${this.date && this.date.toString()}s]`;
    }
}
