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

export interface GetConversationReferenceConfiguration extends DialogConfiguration {
    property?: string | Expression | StringExpression;
    disabled?: boolean | string | Expression | BoolExpression;
}

/**
 * Gets the current conversation reference and saves it to a memory property suitable to use in ContinueConversation action.
 */
export class GetConversationReference extends Dialog implements GetConversationReferenceConfiguration {
    static $kind = 'Microsoft.GetConversationReference';

    /**
     * Gets or sets an optional expression which if true will disable this action.
     */
    public disabled: BoolExpression;

    /**
     * Gets or sets property path to put the value in.
     */
    public property: StringExpression;

    public getConverter(property: keyof GetConversationReferenceConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'property':
                return new StringExpressionConverter();
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

        const cr = TurnContext.getConversationReference(dc.context.activity);
        if (this.property) {
            dc.state.setValue(this.property.getValue(dc.stack), cr);
        }

        return dc.endDialog(cr);
    }

    /**
     * Builds the compute id for the dialog.
     *
     * @returns {string} A string representing the compute id.
     */
    protected onComputeId(): string {
        return `GetConversationReference[${this.property?.toString() ?? ''}]`;
    }
}
