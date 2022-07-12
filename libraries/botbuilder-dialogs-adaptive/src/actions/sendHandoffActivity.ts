// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * @module botbuilder-dialogs-adaptive
 */

import { EventFactory, ResourceResponse, Transcript } from 'botbuilder';
import { ObjectExpression, ObjectExpressionConverter } from 'adaptive-expressions';
import { ObjectProperty } from '../properties';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export interface SendHandoffActivityConfiguration extends DialogConfiguration {
    context?: ObjectProperty<Record<string, unknown>>;
    transcript?: ObjectProperty<Transcript>;
}

/**
 * Sends a handoff activity. Note that this is a single turn/step dialog (i.e. it calls
 * this.endDialog).
 */
export class SendHandoffActivity extends Dialog implements SendHandoffActivityConfiguration {
    static $kind = 'Microsoft.SendHandoffActivity';

    /**
     * Context to send with handoff activity
     */
    context: ObjectExpression<Record<string, unknown>>;

    /**
     * Transcript to send with handoff activity
     */
    transcript: ObjectExpression<Transcript>;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof SendHandoffActivityConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'context':
                return new ObjectExpressionConverter<Record<string, unknown>>();
            case 'transcript':
                return new ObjectExpressionConverter<Transcript>();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param {DialogContext} dc dialog context
     * @returns {Promise<DialogTurnResult<ResourceResponse>>} result of sending handoff activity
     */
    async beginDialog(dc: DialogContext): Promise<DialogTurnResult<ResourceResponse>> {
        const context = this.context?.getValue(dc.state);
        const transcript = this.transcript?.getValue(dc.state);

        const activity = EventFactory.createHandoffInitiation(dc.context, context, transcript);
        const response = await dc.context.sendActivity(activity);

        return dc.endDialog(response);
    }
}
