/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolProperty, StringProperty, UnknownProperty } from '../properties';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogEvents,
    DialogTurnResult,
    TurnPath,
} from 'botbuilder-dialogs';

import {
    BoolExpression,
    BoolExpressionConverter,
    StringExpression,
    StringExpressionConverter,
    ValueExpression,
    ValueExpressionConverter,
} from 'adaptive-expressions';

export interface CancelAllDialogsBaseConfiguration extends DialogConfiguration {
    eventName?: StringProperty;
    eventValue?: UnknownProperty;
    disabled?: BoolProperty;
    activityProcessed?: BoolProperty;
}

/**
 * Base class for [CancelAllDialogs](xref:botbuilder-dialogs-adaptive.CancelAllDialogs) api.
 */
export class CancelAllDialogsBase<O extends object = {}>
    extends Dialog<O>
    implements CancelAllDialogsBaseConfiguration {
    constructor();

    /**
     * Initializes a new instance of the [CancelAllDialogsBase](xref:botbuilder-dialogs-adaptive.CancelAllDialogsBase) class.
     *
     * @param eventName Expression for event name.
     * @param eventValue Optional. Expression for event value.
     * @param isCancelAll Set to `true` to cancel all dialogs; `false` otherwise.
     */
    constructor(eventName: string, eventValue?: string, isCancelAll?: boolean);

    /**
     * Initializes a new instance of the [CancelAllDialogsBase](xref:botbuilder-dialogs-adaptive.CancelAllDialogsBase) class.
     *
     * @param eventName Optional. Expression for event name.
     * @param eventValue Optional. Expression for event value.
     * @param isCancelAll Set to `true` to cancel all [Dialogs](xref:botbuilder-dialogs.Dialog); `false` otherwise.
     */
    constructor(eventName?: string, eventValue?: string, isCancelAll = true) {
        super();
        if (eventName) {
            this.eventName = new StringExpression(eventName);
        }
        if (eventValue) {
            this.eventValue = new ValueExpression(eventValue);
        }
        this._cancelAll = isCancelAll;
    }

    /**
     * Expression for event name.
     */
    eventName: StringExpression;

    /**
     * Expression for event value.
     */
    eventValue: ValueExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled: BoolExpression;

    /**
     * A value indicating whether to have the new dialog should process the activity.
     */
    activityProcessed: BoolExpression;

    private _cancelAll: boolean;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof CancelAllDialogsBaseConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'eventName':
                return new StringExpressionConverter();
            case 'eventValue':
                return new ValueExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            case 'activityProcessed':
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
    async beginDialog(dc: DialogContext, _options: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        let eventName = this.eventName && this.eventName.getValue(dc.state);
        let eventValue = this.eventValue && this.eventValue.getValue(dc.state);

        if (this.activityProcessed && this.activityProcessed.getValue(dc.state) == false) {
            // mark that this hasn't been recognized
            dc.state.setValue(TurnPath.activityProcessed, false);

            // emit ActivityReceived, which will tell parent it's supposed to handle recognition.
            eventName = DialogEvents.activityReceived;
            eventValue = dc.context.activity;
        }

        if (!dc.parent) {
            return await dc.cancelAllDialogs(this._cancelAll, eventName, eventValue);
        } else {
            const turnResult = await dc.parent.cancelAllDialogs(this._cancelAll, eventName, eventValue);
            turnResult.parentEnded = true;
            return turnResult;
        }
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `${this.constructor.name}[${this.eventName ? this.eventName.toString() : ''}]`;
    }
}
