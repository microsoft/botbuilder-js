/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Converters, Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression, StringExpressionConverter, BoolExpressionConverter } from 'adaptive-expressions';

export class DeleteActivity<O extends object = {}> extends Dialog<O> {
    public static $kind = 'Microsoft.DeleteActivity';

    public constructor();
    public constructor(activityId?: string) {
        super();
        if (activityId) {
            this.activityId = new StringExpression(activityId);
        }
    }

    /**
     * The expression which resolves to the activityId to update.
     */
    public activityId: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public get converters(): Converters<DeleteActivity> {
        return {
            activityId: new StringExpressionConverter(),
            disabled: new BoolExpressionConverter(),
        };
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
        return `DeleteActivity[${this.activityId.toString()}]`;
    }
}
