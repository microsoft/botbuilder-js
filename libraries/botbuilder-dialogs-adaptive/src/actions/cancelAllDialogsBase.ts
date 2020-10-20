/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
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
    StringExpression,
    BoolExpression,
    ValueExpression,
    StringExpressionConverter,
    ValueExpressionConverter,
    BoolExpressionConverter,
    Expression,
} from 'adaptive-expressions';

export interface CancelAllDialogsBaseConfiguration extends DialogConfiguration {
    eventName?: string | Expression | StringExpression;
    eventValue?: unknown | ValueExpression;
    disabled?: boolean | string | Expression | BoolExpression;
    activityProcessed?: boolean | string | Expression | BoolExpression;
}

export class CancelAllDialogsBase<O extends object = {}>
    extends Dialog<O>
    implements CancelAllDialogsBaseConfiguration {
    public constructor();
    public constructor(eventName: string, eventValue?: string, isCancelAll?: boolean);
    public constructor(eventName?: string, eventValue?: string, isCancelAll = true) {
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
    public eventName: StringExpression;

    /**
     * Expression for event value.
     */
    public eventValue: ValueExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled: BoolExpression;

    /**
     * A value indicating whether to have the new dialog should process the activity.
     */
    public activityProcessed: BoolExpression;

    private _cancelAll: boolean;

    public getConverter(property: keyof CancelAllDialogsBaseConfiguration): Converter | ConverterFactory {
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

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
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

    protected onComputeId(): string {
        return `${this.constructor.name}[${this.eventName ? this.eventName.toString() : ''}]`;
    }
}
