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
    IntExpression,
    IntExpressionConverter,
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

export interface GetPagedMembersConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    property?: string | Expression | StringExpression;
    continuationToken?: string | Expression | StringExpression;
    pageSize?: number | Expression | IntExpression;
}

/**
 * Calls TeamsInfo.getPagedMembers to retrieve a paginated list of members of
 * one-on-one, group, or team conversation and sets the result to a memory property.
 */
export class GetPagedMembers extends Dialog implements GetPagedMembersConfiguration {
    /**
     * Class identifier.
     */
    static $kind = 'Teams.GetPagedMembers';

    /**
     * Gets or sets an optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Gets or sets property path to put the value in.
     */
    public property?: StringExpression;

    /**
     * Gets or sets the expression to get the value to use for the continuationToken.
     */
    public continuationToken?: StringExpression;

    /**
     * Gets or sets the expression to get the value to use for the page size.
     */
    public pageSize?: IntExpression;

    public getConverter(property: keyof GetPagedMembersConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'property':
            case 'continuationToken':
                return new StringExpressionConverter();
            case 'pageSize':
                return new IntExpressionConverter();
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
            throw new Error(`${GetPagedMembers.$kind} works only on the Teams channel.`);
        }

        const continuationToken = getValue(dc, this.continuationToken);
        const pageSize = getValue(dc, this.pageSize);

        const result = await TeamsInfo.getPagedMembers(dc.context, pageSize, continuationToken);

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
        return `GetPagedMembers[\
            ${this.continuationToken?.toString() ?? ''},\
            ${this.pageSize?.toString() ?? ''},\
            ${this.property?.toString() ?? ''}\
        ]`;
    }
}
