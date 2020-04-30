/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression } from 'adaptive-expressions';

export class SignOutUser<O extends object = {}> extends Dialog<O> {
    public constructor();
    public constructor(userId?: string, connectionName?: string) {
        super();
        if (userId) { this.userId = new StringExpression(userId); }
        if (connectionName) { this.connectionName = new StringExpression(connectionName); }
    }

    /**
     * The expression which resolves to the userId to sign out.
     */
    public userId: StringExpression;

    /**
     * The name of the OAuth connection.
     */
    public connectionName: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
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

    protected onComputeId(): string {
        return `SignOutUser[${ this.connectionName ? this.connectionName.toString() : '' }, ${ this.userId ? this.userId.toString() : '' }]`;
    }
}