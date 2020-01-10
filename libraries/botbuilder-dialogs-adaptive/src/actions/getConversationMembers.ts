/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Configurable, Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'botframework-expressions';

export interface GetConversationMembersConfiguration extends DialogConfiguration {
    property?: string;
    disabled?: string;
}

export class GetConversationMembers<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.GetConversationMembers';

    public constructor();
    public constructor(property?: string) {
        super();
        if (property) { this.property = property; }
    }

    /**
     * Property path to put the value in.
     */
    public property: string;

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

    private _disabled: Expression;

    public configure(config: GetConversationMembersConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        const adapter = dc.context.adapter;
        if (typeof adapter['getConversationMembers'] === 'function') {
            const result = await adapter['getConversationMembers'].getConversationMembers(dc.context);
            dc.state.setValue(this.property, result);
            return await dc.endDialog(result);
        } else {
            throw new Error('getConversationMembers() not supported by the current adapter.');
        }
    }

    protected onComputeId(): string {
        return `GetConversationMembers[${ this.property }]`;
    }
}
 