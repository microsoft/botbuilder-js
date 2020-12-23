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
import { Activity, Channels, TeamsInfo } from 'botbuilder';
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogStateManager,
    DialogTurnResult,
    TemplateInterface,
} from 'botbuilder-dialogs';
import { getValue } from './actionHelpers';

export interface SendMessageToTeamsChannelConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    property?: string | Expression | StringExpression;
    conversationReferenceProperty?: string | Expression | StringExpression;
    activityIdProperty?: string | Expression | StringExpression;
    teamsChannelId?: string | Expression | StringExpression;
    activity?: TemplateInterface<Activity, DialogStateManager>;
}

/**
 * Calls TeamsInfo.GetTeamDetails and sets the result to a memory property.
 */
export class SendMessageToTeamsChannel extends Dialog implements SendMessageToTeamsChannelConfiguration {
    /**
     * Class identifier.
     */
    public static $kind = 'Teams.SendMessageToTeamsChannel';

    /**
     * Gets or sets an optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Gets or sets property path to put the newly created activity's Conversation Reference.
     * This can be used to later send messages to this same conversation.
     */
    public conversationReferenceProperty: StringExpression;

    /**
     *  Gets or sets property path to put the id of the activity sent.
     */
    public activityIdProperty: StringExpression;

    /**
     * Gets or sets the expression to get the value to use for team id.
     *
     * @default
     * ==turn.activity.channelData.team.id
     */
    public teamsChannelId: StringExpression = new StringExpression('=turn.activity.channelData.team.id');

    /**
     * Gets or sets template for the activity expression containing the activity to send.
     */
    public activity: TemplateInterface<Activity, DialogStateManager>;

    public getConverter(property: keyof SendMessageToTeamsChannelConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'property':
            case 'conversationReferenceProperty':
            case 'activityIdProperty':
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
        if (this.disabled && this.disabled?.getValue(dc.state)) {
            return dc.endDialog();
        }

        if (dc.context.activity.channelId !== Channels.Msteams) {
            throw new Error('TeamsInfo.sendMessageToTeamsChannel() works only on the Teams channel.');
        }

        let activity;
        if (this.activity) {
            activity = await this.activity.bind(dc, dc.state);
        }

        let teamsChannelId = getValue(dc, this.teamsChannelId);

        if (!teamsChannelId) {
            teamsChannelId = dc.context.activity?.channelData?.team?.id;
        }

        const result = await TeamsInfo.sendMessageToTeamsChannel(dc.context, activity, teamsChannelId);

        if (this.conversationReferenceProperty != null) {
            dc.state.setValue(this.conversationReferenceProperty?.getValue(dc.state), result[0]);
        }

        if (this.activityIdProperty != null) {
            dc.state.setValue(this.activityIdProperty?.getValue(dc.state), result[1]);
        }

        return dc.endDialog(result);
    }

    /**
     * Builds the compute Id for the dialog.
     *
     * @returns {string} A string representing the compute Id.
     */
    protected onComputeId(): string {
        return `SendMessageToTeamsChannel[
            ${this.teamsChannelId?.toString() ?? ''},
            ${this.activityIdProperty?.toString() ?? ''},
            ${this.conversationReferenceProperty?.toString() ?? ''}
        ]`;
    }
}
