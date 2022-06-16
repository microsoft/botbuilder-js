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

export interface SignOutUserConfiguration extends DialogConfiguration {
    userId?: StringProperty;
    connectionName?: StringProperty;
    disabled?: BoolProperty;
}

/**
 * Singns out the user and finishes the dialog.
 */
export class SignOutUser<O extends object = {}> extends Dialog<O> implements SignOutUserConfiguration {
    static $kind = 'Microsoft.SignOutUser';

    constructor();

    /**
     * Initializes a new instance of the [SignOutUser](xref:botbuilder-dialogs-adaptive.SignOutUser) class.
     *
     * @param userId Optional. The expression which resolves to the userId to sign out.
     * @param connectionName Optional. The name of the OAuth connection.
     */
    constructor(userId?: string, connectionName?: string) {
        super();
        if (userId) {
            this.userId = new StringExpression(userId);
        }
        if (connectionName) {
            this.connectionName = new StringExpression(connectionName);
        }
    }

    /**
     * The expression which resolves to the userId to sign out.
     */
    userId: StringExpression;

    /**
     * The name of the OAuth connection.
     */
    connectionName: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof SignOutUserConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'userId':
                return new StringExpressionConverter();
            case 'connectionName':
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

        let userId: string;
        if (this.userId) {
            userId = this.userId.getValue(dc.state);
        }
        const connectionName: string = this.connectionName.getValue(dc.state);

        const adapter = dc.context.adapter;
        if (typeof adapter['signOutUser'] === 'function') {
            await adapter['signOutUser'](dc.context, connectionName, userId);
            return await dc.endDialog();
        } else {
            throw new Error('signOutUser() not supported by the current adapter.');
        }
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `SignOutUser[${this.connectionName ? this.connectionName.toString() : ''}, ${
            this.userId ? this.userId.toString() : ''
        }]`;
    }
}
