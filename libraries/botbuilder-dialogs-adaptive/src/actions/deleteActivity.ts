/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Configurable, Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'adaptive-expressions';

export interface DeleteActivityConfiguration extends DialogConfiguration {
    activityId?: string;
    disabled?: string;
}

export class DeleteActivity<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.DeleteActivity'

    public constructor();
    public constructor(activityId?: string) {
        super();
        if (activityId) { this.activityId = activityId; }
    }

    /**
     * Get the expression which resolves to the activityId to update.
     */
    public get activityId(): string {
        return this._activityId ? this._activityId.toString() : undefined;
    }

    /**
     * Set the expression which resolves to the activityId to update.
     */
    public set activityId(value: string) {
        this._activityId = value ? new ExpressionEngine().parse(value) : undefined;
    }

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

    private _activityId: Expression;

    private _disabled: Expression;

    public configure(config: DeleteActivityConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        const { value, error } = this._activityId.tryEvaluate(dc.state);
        if (error) {
            throw new Error(error);
        }

        const id = value.toString();
        await dc.context.deleteActivity(id);
        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `DeleteActivity[${ this.activityId }]`;
    }
}