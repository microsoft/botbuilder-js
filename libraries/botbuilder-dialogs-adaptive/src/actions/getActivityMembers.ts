/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Converters, Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression, BoolExpressionConverter, StringExpressionConverter } from 'adaptive-expressions';

export class GetActivityMembers<O extends object = {}> extends Dialog {
    public static $kind = 'Microsoft.GetActivityMembers';

    public constructor();
    public constructor(activityId?: string, property?: string) {
        super();
        if (activityId) {
            this.activityId = new StringExpression(activityId);
        }
        if (property) {
            this.property = new StringExpression(property);
        }
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

    public get converters(): Converters<GetActivityMembers> {
        return {
            activityId: new StringExpressionConverter(),
            property: new StringExpressionConverter(),
            disabled: new BoolExpressionConverter(),
        };
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
        return `GetActivityMembers[${this.activityId ? this.activityId.toString() : ''}, ${
            this.property ? this.property.toString() : ''
        }]`;
    }
}
