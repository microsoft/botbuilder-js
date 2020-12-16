/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';
import { Channels, TeamsInfo } from 'botbuilder';
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export interface GetMeetingParticipantConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    property?: string | Expression | StringExpression;
    meetingId?: string | Expression | StringExpression;
    participantId?: string | Expression | StringExpression;
    tenantId?: string | Expression | StringExpression;
}

/**
 * Calls `TeamsInfo.getMeetingParticipant` ans sets the result to a memory property.
 */
export class GetMeetingParticipant extends Dialog implements GetMeetingParticipantConfiguration {
    public static $kind = 'Teams.GetMeetingParticipant';

    /**
     * Gets or sets an optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Gets or sets property path to put the value in.
     */
    public property: StringExpression;

    /**
     * Gets or sets the expression to get the value to use for meeting id.
     */
    public meetingId = new StringExpression('=turn.activity.channelData.meeting.id');

    /**
     * Gets or sets the expression to get the value to use for participant id.
     */
    public participantId = new StringExpression('=turn.activity.from.aadObjectId');

    /**
     * Gets or sets the expression to get the value to use for tenant id.
     */
    public tenantId = new StringExpression('=turn.activity.channelData.tenant.id');

    public getConverter(property: keyof GetMeetingParticipantConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'property':
                return new StringExpressionConverter();
            case 'meetingId':
                return new StringExpressionConverter();
            case 'tenantId':
                return new StringExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     *
     * @param {DialogContext} dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param {object} options Optional, initial information to pass to the dialog.
     * @returns {Promise<DialogTurnResult>} A promise representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: Record<string, unknown>): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return dc.endDialog();
        }

        if (dc.context.activity.channelId !== Channels.Msteams) {
            throw new Error('TeamsInfo.getMeetingParticipant() works only on the Teams channel.');
        }

        const meetingId = this.getValue(dc, this.meetingId);
        const participantId = this.getValue(dc, this.participantId);
        const tenantId = this.getValue(dc, this.tenantId);

        if (!participantId) {
            /**
             * TeamsInfo.getMeetingParticipant will default to retrieving the current meeting's participant
             * if none is provided. This could lead to unexpected results. Therefore, GetMeetingParticipant action
             * throws an exception if the expression provided somehow maps to an invalid result.
             */
            throw new Error(
                'GetMeetingParticipant could determine the participant id by expression value provided. participantId is required.'
            );
        }

        const result = await TeamsInfo.getMeetingParticipant(dc.context, meetingId, participantId, tenantId);
        dc.state.setValue(this.property.getValue(dc.state), result);
        return dc.endDialog(result);
    }

    protected onComputeId(): string {
        return `GetMeetingParticipantId[${this.meetingId ?? ''},
            ${this.participantId?.toString() ?? ''},
            ${this.tenantId?.toString() ?? ''},
            ${this.property?.toString() ?? ''}]`;
    }

    private getValue(dc: DialogContext, stringExpression: StringExpression): string {
        if (stringExpression) {
            const { value, error } = stringExpression.tryGetValue(dc.state);
            if (error) {
                throw new Error(
                    `Expression evaluation resulted in an error. Expression: "${stringExpression.expressionText}". Error: ${error}`
                );
            }
            return value;
        }
        return undefined;
    }
}
