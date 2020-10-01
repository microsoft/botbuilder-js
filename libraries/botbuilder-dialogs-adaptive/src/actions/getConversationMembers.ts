/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression } from 'adaptive-expressions';

/**
 * Calls `BotFrameworkAdapter.getConversationMembers()` and sets the result to a memory property.
 */
export class GetConversationMembers<O extends object = {}> extends Dialog<O> {
    public constructor();

    /**
     * Initializes a new instance of the `GetConversationMembers` class.
     * @param property Property path to put the value in.
     */
    public constructor(property?: string) {
        super();
        if (property) { this.property = new StringExpression(property); }
    }

    /**
     * Property path to put the value in.
     */
    public property: StringExpression;

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

        const adapter = dc.context.adapter;
        if (typeof adapter['getConversationMembers'] === 'function') {
            const result = await adapter['getConversationMembers'].getConversationMembers(dc.context);
            dc.state.setValue(this.property.getValue(dc.state), result);
            return await dc.endDialog(result);
        } else {
            throw new Error('getConversationMembers() not supported by the current adapter.');
        }
    }

    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `GetConversationMembers[${ this.property.toString() }]`;
    }
}
 