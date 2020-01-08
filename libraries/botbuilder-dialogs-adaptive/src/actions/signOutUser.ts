/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Configurable, Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'botframework-expressions';

export interface SignOutUserConfiguration extends DialogConfiguration {
    userId?: string;
    connectionName?: string;
    disabled?: string;
}

export class SignOutUser<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.SignOutUser';

    public constructor();
    public constructor(userId?: string, connectionName?: string) {
        super();
        if (userId) { this.userId = userId; }
        if (connectionName) { this.connectionName = connectionName; }
    }

    /**
     * Get the expression which resolves to the userId to sign out.
     */
    public get userId(): string {
        return this._userId ? this._userId.toString() : undefined;
    }

    /**
     * Set the expression which resolves to the userId to sign out.
     */
    public set userId(value: string) {
        this._userId = value ? new ExpressionEngine().parse(value) : undefined;
    }

    public connectionName: string;

    /**
     * Get an optional expression which if is true will disable this action.
     */
    public get disabled(): string {
        return this._disabled ? this._disabled.toString() : undefined;
    }

    /**
     * Set an optional expression which if is true will disable this action.
     */
    public set disabled(value: string) {
        this._disabled = value ? new ExpressionEngine().parse(value) : undefined;
    }

    private _userId: Expression;

    private _disabled: Expression;

    public configure(config: SignOutUserConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        let userId: string;
        if (this._userId) {
            const { value } = this._userId.tryEvaluate(dc.state);
            if (value) {
                userId = value.toString();
            }
        }

        const adapter = dc.context.adapter;
        if (typeof adapter['signOutUser'] === 'function') {
            await adapter['signOutUser'](dc.context, this.connectionName, userId);
            return await dc.endDialog();
        } else {
            throw new Error('signOutUser() not supported by the current adapter.');
        }
    }

    protected onComputeId(): string {
        return `SignOutUser[${ this.connectionName }, ${ this.userId }]`;
    }
}