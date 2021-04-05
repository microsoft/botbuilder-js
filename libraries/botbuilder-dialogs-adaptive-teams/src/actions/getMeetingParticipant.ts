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
import { getValue } from './actionHelpers';

export interface GetMeetingParticipantConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    property?: string | Expression | StringExpression;
    meetingId?: string | Expression | StringExpression;
    participantId?: string | Expression | StringExpression;
    tenantId?: string | Expression | StringExpression;
}

/**
 * Calls `TeamsInfo.getMeetingParticipant` and sets the result to a memory property.
 */
export class GetMeetingParticipant extends Dialog implements GetMeetingParticipantConfiguration {
    /**
     * Class identifier.
     */
    static $kind = 'Teams.GetMeetingParticipant';

    /**
     * Gets or sets an optional expression which if is true will disable this action.
     *
     * @example
     * "user.age > 18".
     */
    public disabled?: BoolExpression;

    /**
     * Gets or sets property path to put the value in.
     */
    public property?: StringExpression;

    /**
     * Gets or sets the expression to get the value to use for meeting id.
     *
     * @default
     * =turn.activity.channelData.meeting.id
     */
    public meetingId = new StringExpression('=turn.activity.channelData.meeting.id');

    /**
     * Gets or sets the expression to get the value to use for participant id.
     *
     * @default
     * =turn.activity.from.aadObjectId
     */
    public participantId = new StringExpression('=turn.activity.from.aadObjectId');

    /**
     * Gets or sets the expression to get the value to use for tenant id.
     *
     * @default
     * =turn.activity.channelData.tenant.id
     */
    public tenantId = new StringExpression('=turn.activity.channelData.tenant.id');

    public getConverter(property: keyof GetMeetingParticipantConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'property':
            case 'meetingId':
            case 'participantId':
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
     * @param {object} _options Optional, initial information to pass to the dialog.
     * @returns {Promise<DialogTurnResult>} A promise representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, _options?: Record<string, unknown>): Promise<DialogTurnResult> {
        if (this.disabled?.getValue(dc.state)) {
            return dc.endDialog();
        }

        if (dc.context.activity.channelId !== Channels.Msteams) {
            throw new Error(`${GetMeetingParticipant.$kind} works only on the Teams channel.`);
        }

        const meetingId = getValue(dc, this.meetingId);
        const participantId = getValue(dc, this.participantId);
        const tenantId = getValue(dc, this.tenantId);

        if (participantId == null) {
            /**
             * TeamsInfo.getMeetingParticipant will default to retrieving the current meeting's participant
             * if none is provided. This could lead to unexpected results. Therefore, GetMeetingParticipant action
             * throws an exception if the expression provided somehow maps to an invalid result.
             */
            throw new Error(
                `${GetMeetingParticipant.$kind} could not determine the participant id by expression value provided. participantId is required.`
            );
        }

        const result = await TeamsInfo.getMeetingParticipant(dc.context, meetingId, participantId, tenantId);

        if (this.property != null) {
            dc.state.setValue(this.property.getValue(dc.state), result);
        }

        return dc.endDialog(result);
    }

    /**
     * Builds the compute Id for the dialog.
     *
     * @returns {string} A string representing the compute Id.
     */
    protected onComputeId(): string {
        return `GetMeetingParticipant[\
            ${this.meetingId ?? ''},\
            ${this.participantId?.toString() ?? ''},
            ${this.tenantId?.toString() ?? ''},\
            ${this.property?.toString() ?? ''}\
        ]`;
    }
}
