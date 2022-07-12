/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolProperty, StringProperty } from '../properties';

import {
    BoolExpression,
    BoolExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export interface DeleteActivityConfiguration extends DialogConfiguration {
    activityId?: StringProperty;
    disabled?: BoolProperty;
}

/**
 * Ends and deletes an activity.
 */
export class DeleteActivity<O extends object = {}> extends Dialog<O> implements DeleteActivityConfiguration {
    static $kind = 'Microsoft.DeleteActivity';

    constructor();

    /**
     * Initializes a new instance of the [DeleteActivity](xref:botbuilder-dialogs-adaptive.DeleteActivity) class.
     *
     * @param activityId ID of the activity to update.
     */
    constructor(activityId?: string) {
        super();
        if (activityId) {
            this.activityId = new StringExpression(activityId);
        }
    }

    /**
     * The expression which resolves to the activityId to update.
     */
    activityId: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof DeleteActivityConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'activityId':
                return new StringExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is started and pushed onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        const value = this.activityId.getValue(dc.state);
        const id = value.toString();
        await dc.context.deleteActivity(id);
        return await dc.endDialog();
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `DeleteActivity[${this.activityId.toString()}]`;
    }
}
