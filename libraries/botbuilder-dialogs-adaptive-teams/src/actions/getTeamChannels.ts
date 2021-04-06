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

export interface GetTeamChannelsConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    property?: string | Expression | StringExpression;
    teamId?: string | Expression | StringExpression;
}

/**
 * Calls TeamsInfo.getTeamChannels to retrieve a list of channels in a
 * Team and sets the result to a memory property. This only works in
 * teams scoped conversations.
 */
export class GetTeamChannels extends Dialog implements GetTeamChannelsConfiguration {
    /**
     * Class identifier.
     */
    static $kind = 'Teams.GetTeamChannels';

    /**
     * Gets or sets an optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Gets or sets property path to put the value in.
     */
    public property?: StringExpression;

    /**
     * Gets or sets the expression to get the value to use for team id.
     *
     * @default
     * ==turn.activity.channelData.team.id
     */
    public teamId: StringExpression = new StringExpression('=turn.activity.channelData.team.id');

    public getConverter(property: keyof GetTeamChannelsConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'property':
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
            throw new Error(`${GetTeamChannels.$kind} works only on the Teams channel.`);
        }

        const teamId = getValue(dc, this.teamId);

        const result = await TeamsInfo.getTeamChannels(dc.context, teamId);

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
        return `GetTeamChannels[\
            ${this.teamId?.toString() ?? ''},\
            ${this.property?.toString() ?? ''}\
        ]`;
    }
}
