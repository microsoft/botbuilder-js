/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Configurable, Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression } from '../expressionProperties';

export interface GetActivityMembersConfiguration extends DialogConfiguration {
    activityId?: string;
    property?: string;
    disabled?: string | BoolExpression;
}

export class GetActivityMembers<O extends object = {}> extends Dialog implements Configurable {
    public static declarativeType = 'Microsoft.GetActivityMembers';

    public constructor();
    public constructor(activityId?: string, property?: string) {
        super();
        if (activityId) { this.activityId = new StringExpression(activityId); }
        if (property) { this.property = new StringExpression(property); }
    }

    /**
     * The expression to get the value to put into property path.
     */
    public activityId: StringExpression;

    /**
     * Property path to put the value in.
     */
    public property: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public configure(config: GetActivityMembersConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'activityId':
                        this.activityId = new StringExpression(value);
                        break;
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

        let id = dc.context.activity.id;
        if (this.activityId) {
            const value = this.activityId.getValue(dc.state);
            id = value.toString();
        }

        const adapter = dc.context.adapter;
        if (typeof adapter['getActivityMembers'] === 'function') {
            const result = await adapter['getActivityMembers'].getActivityMembers(dc.context, id);
            dc.state.setValue(this.property.getValue(dc.state), result);
            return await dc.endDialog(result);
        } else {
            throw new Error('getActivityMembers() not supported by the current adapter.');
        }
    }

    protected onComputeId(): string {
        return `GetActivityMembers[${ this.activityId.toString() },${ this.property.toString() }]`;
    }
}