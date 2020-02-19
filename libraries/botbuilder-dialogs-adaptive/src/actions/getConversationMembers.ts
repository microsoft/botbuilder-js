/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Configurable, Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression } from '../expressionProperties';

export interface GetConversationMembersConfiguration extends DialogConfiguration {
    property?: string;
    disabled?: string | boolean;
}

export class GetConversationMembers<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.GetConversationMembers';

    public constructor();
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

    public configure(config: GetConversationMembersConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'property':
                        this.property = new StringExpression(value);
                        break;
                    case 'disabled':
                        this.disabled = new BoolExpression(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

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

    protected onComputeId(): string {
        return `GetConversationMembers[${ this.property.toString() }]`;
    }
}
 