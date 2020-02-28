/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Configurable, Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'adaptive-expressions';

export interface GetActivityMembersConfiguration extends DialogConfiguration {
    activityId?: string;
    property?: string;
    disabled?: string;
}

export class GetActivityMembers<O extends object = {}> extends Dialog implements Configurable {
    public static declarativeType = 'Microsoft.GetActivityMembers';

    public constructor();
    public constructor(activityId?: string, property?: string) {
        super();
        if (activityId) { this.activityId = activityId; }
        if (property) { this.property = property; }
    }

    /**
     * Get the expression to get the value to put into property path.
     */
    public get activityId(): string {
        return this._activityId ? this._activityId.toString() : undefined;
    }

    /**
     * Set the expression to get the value to put into property path.
     */
    public set activityId(value: string) {
        this._activityId = value ? new ExpressionEngine().parse(value) : undefined;
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

    private _activityId: Expression;

    private _disabled: Expression;

    public configure(config: GetActivityMembersConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        let id = dc.context.activity.id;
        if (this._activityId) {
            const { value, error } = this._activityId.tryEvaluate(dc.state);
            if (error) {
                throw new Error(`Expression evaluation resulted in an error. Expression: ${ this.activityId }. Error: ${ error } `);
            }
            id = value.toString();
        }

        const adapter = dc.context.adapter;
        if (typeof adapter['getActivityMembers'] === 'function') {
            const result = await adapter['getActivityMembers'].getActivityMembers(dc.context, id);
            dc.state.setValue(this.property, result);
            return await dc.endDialog(result);
        } else {
            throw new Error('getActivityMembers() not supported by the current adapter.');
        }
    }

    protected onComputeId(): string {
        return `GetActivityMembers[${ this.activityId },${ this.property }]`;
    }
}