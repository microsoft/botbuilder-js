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
    ObjectExpression,
    ObjectExpressionConverter,
    ValueExpression,
    ValueExpressionConverter,
} from 'adaptive-expressions';
import {
    Activity,
    ActivityEventNames,
    ActivityTypes,
    ConversationReference,
    QueueStorage,
    TurnContext,
} from 'botbuilder';
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
    DialogTurnStateConstants,
} from 'botbuilder-dialogs';

export interface ContinueConversationConfiguration extends DialogConfiguration {
    disabled?: boolean | string | Expression | BoolExpression;
    conversationReference?: string | Expression | ObjectExpression<ConversationReference>;
    value?: unknown | ValueExpression;
}

/**
 * Action which continues a conversation using a Conversation reference.
 */
export class ContinueConversation extends Dialog implements ContinueConversationConfiguration {
    static $kind = 'Microsoft.ContinueConversation';

    /**
     * Gets or sets an optional expression which if true will disable this action.
     */
    public disabled: BoolExpression;

    /**
     * Gets or sets the conversationReference for the target conversation.
     */
    public conversationReference: ObjectExpression<ConversationReference>;

    /**
     * Gets or sets an optional value to use for EventActivity.Value.
     */
    public value: ValueExpression;

    public getConverter(property: keyof ContinueConversationConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'conversationReference':
                return new ObjectExpressionConverter<ConversationReference>();
            case 'value':
                return new ValueExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     *
     * @param {DialogContext} dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param {Record<string, ?>} _options Optional, initial information to pass to the dialog.
     * @returns {Promise<DialogTurnResult>} A promise representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, _options?: Record<string, unknown>): Promise<DialogTurnResult> {
        if (this.disabled?.getValue(dc.state)) {
            return dc.endDialog();
        }

        const conversationReference = this.conversationReference.getValue(dc.state);
        const continueActivity: Partial<Activity> = TurnContext.applyConversationReference(
            {
                type: ActivityTypes.Event,
                name: ActivityEventNames.ContinueConversation,
                relatesTo: conversationReference,
                value: this.value?.getValue(dc.state),
            },
            conversationReference,
            true
        );

        const queueStorage: QueueStorage = dc.context.turnState.get(DialogTurnStateConstants.queueStorage);
        if (!queueStorage) {
            throw new Error('Unable to locate QueueStorage in HostContext');
        }

        const receipt = await queueStorage.queueActivity(continueActivity);

        // return ths receipt as the result.
        return dc.endDialog(receipt);
    }

    /**
     * Builds the compute id for the dialog.
     *
     * @returns {string} A string representing the compute id.
     */
    protected onComputeId(): string {
        return `ContinueConversation[${this.conversationReference?.toString() ?? ''}]`;
    }
}
