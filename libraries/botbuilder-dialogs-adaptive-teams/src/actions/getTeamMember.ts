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

export interface GetTeamMemberConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    property?: string | Expression | StringExpression;
    memberId?: string | Expression | StringExpression;
    teamId?: string | Expression | StringExpression;
}

/**
 * Calls TeamsInfo.GetTeamMember to retrieve the list of members in a teams
 * scoped conversation and sets the result to a memory property.
 */
export class GetTeamMember extends Dialog implements GetTeamMemberConfiguration {
    /**
     * Class identifier.
     */
    static $kind = 'Teams.GetTeamMember';

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
     * Gets or sets the expression to get the value to use for member id.
     *
     * @default
     * =turn.activity.from.id
     */
    public memberId = new StringExpression('=turn.activity.from.id');

    /**
     * Gets or sets the expression to get the value to use for team id.
     *
     * @default
     * =turn.activity.channelData.team.id
     */
    public teamId = new StringExpression('=turn.activity.channelData.team.id');

    public getConverter(property: keyof GetTeamMemberConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'property':
            case 'memberId':
            case 'teamId':
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
            throw new Error(`${GetTeamMember.$kind} works only on the Teams channel.`);
        }

        const memberId = getValue(dc, this.memberId);

        if (!memberId) {
            throw new Error(`Missing MemberId in ${GetTeamMember.$kind}.`);
        }

        const teamId = getValue(dc, this.teamId);

        const result = await TeamsInfo.getTeamMember(dc.context, teamId, memberId);

        if (this.property != null) {
            dc.state.setValue(this.property?.getValue(dc.state), result);
        }

        return dc.endDialog(result);
    }

    /**
     * Builds the compute Id for the dialog.
     *
     * @returns {string} A string representing the compute Id.
     */
    protected onComputeId(): string {
        return `GetTeamMember[\
            ${this.memberId?.toString() ?? ''},\
            ${this.teamId?.toString() ?? ''},\
            ${this.property?.toString() ?? ''}\
        ]`;
    }
}
