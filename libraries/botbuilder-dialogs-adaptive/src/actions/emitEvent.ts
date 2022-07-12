/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolProperty, StringProperty, UnknownProperty } from '../properties';

import {
    BoolExpression,
    BoolExpressionConverter,
    StringExpression,
    StringExpressionConverter,
    ValueExpression,
    ValueExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export interface EmitEventConfiguration extends DialogConfiguration {
    eventName?: StringProperty;
    eventValue?: UnknownProperty;
    bubbleEvent?: BoolProperty;
    handledProperty?: StringProperty;
    disabled?: BoolProperty;
}

/**
 * Action which emits an event declaratively.
 */
export class EmitEvent<O extends object = {}> extends Dialog<O> implements EmitEventConfiguration {
    static $kind = 'Microsoft.EmitEvent';

    constructor();

    /**
     * Initializes a new instance of the [EmitEvent](xref:botbuilder-dialogs-adaptive.EmitEvent) class.
     *
     * @param eventName Name of the event to emit.
     * @param eventValue Optional. Memory property path to use to get the value to send as part of the event.
     * @param bubbleEvent Default = `false`. Value indicating whether the event should bubble to parents or not.
     */
    constructor(eventName: string, eventValue?: string, bubbleEvent?: boolean);

    /**
     * Initializes a new instance of the [EmitEvent](xref:botbuilder-dialogs-adaptive.EmitEvent) class.
     *
     * @param eventName Optional. Name of the event to emit.
     * @param eventValue Optional. Memory property path to use to get the value to send as part of the event.
     * @param bubbleEvent Default = `false`. Value indicating whether the event should bubble to parents or not.
     */
    constructor(eventName?: string, eventValue?: string, bubbleEvent = false) {
        super();
        if (eventName) {
            this.eventName = new StringExpression(eventName);
        }
        if (eventValue) {
            this.eventValue = new ValueExpression(eventValue);
        }
        this.bubbleEvent = new BoolExpression(bubbleEvent);
    }

    /**
     * The name of the event to emit.
     */
    eventName: StringExpression;

    /**
     * The memory property path to use to get the value to send as part of the event.
     */
    eventValue: ValueExpression;

    /**
     * A value indicating whether gets or sets whether the event should bubble or not.
     */
    bubbleEvent: BoolExpression;

    /**
     * The property path to store whether the event was handled or not.
     */
    handledProperty: StringExpression = new StringExpression('turn.eventHandled');

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof EmitEventConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'eventName':
            case 'handledProperty':
                return new StringExpressionConverter();
            case 'eventValue':
                return new ValueExpressionConverter();
            case 'bubbleEvent':
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        let eventName: string;
        if (this.eventName) {
            eventName = this.eventName.getValue(dc.state);
        }

        let eventValue: any;
        if (this.eventValue) {
            eventValue = this.eventValue.getValue(dc.state);
        }

        let bubbleEvent = false;
        if (this.bubbleEvent) {
            bubbleEvent = this.bubbleEvent.getValue(dc.state);
        }

        let handled = false;
        if (dc.parent) {
            handled = await dc.parent.emitEvent(eventName, eventValue, bubbleEvent, false);
        } else {
            handled = await dc.emitEvent(eventName, eventValue, bubbleEvent, false);
        }

        // Save results of operation.
        const handledProperty = this.handledProperty?.getValue(dc.state);
        if (handledProperty) {
            dc.state.setValue(handledProperty, handled);
        }

        return await dc.endDialog(handled);
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `EmitEvent[${this.eventName.toString() || ''}]`;
    }
}
