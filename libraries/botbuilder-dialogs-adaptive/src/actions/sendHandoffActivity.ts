// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * @module botbuilder-dialogs-adaptive
 */

import { Expression, ObjectExpression, ObjectExpressionConverter } from 'adaptive-expressions';
import { EventFactory, ResourceResponse, Transcript } from 'botbuilder';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export interface SendHandoffActivityConfiguration extends DialogConfiguration {
    context?: string | Expression | ObjectExpression<Record<string, unknown>>;
    transcript?: string | Expression | ObjectExpression<Transcript>;
}

/**
 * Sends a handoff activity. Note that this is a single turn/step dialog (i.e. it calls
 * this.endDialog).
 */
export class SendHandoffActivity extends Dialog implements SendHandoffActivityConfiguration {
    public static $kind = 'Microsoft.SendHandoffActivity';

    /**
     * Context to send with handoff activity
     */
    public context: ObjectExpression<Record<string, unknown>>;

    /**
     * Transcript to send with handoff activity
     */
    public transcript: ObjectExpression<Transcript>;

    public getConverter(property: keyof SendHandoffActivityConfiguration): Converter | ConverterFactory {
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
