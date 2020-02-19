/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Configurable, Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression } from '../expressionProperties';

export interface DeleteActivityConfiguration extends DialogConfiguration {
    activityId?: string;
    disabled?: string | boolean;
}

export class DeleteActivity<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.DeleteActivity'

    public constructor();
    public constructor(activityId?: string) {
        super();
        if (activityId) { this.activityId = new StringExpression(activityId); }
    }

    /**
     * The expression which resolves to the activityId to update.
     */
    public activityId: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public configure(config: DeleteActivityConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'activityId':
                        this.activityId = new StringExpression(value);
                        break;
                    case 'disabled':
                        this.disabled = new BoolExpression(value);
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

        const value = this.activityId.getValue(dc.state);
        const id = value.toString();
        await dc.context.deleteActivity(id);
        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `DeleteActivity[${ this.activityId.toString() }]`;
    }
}