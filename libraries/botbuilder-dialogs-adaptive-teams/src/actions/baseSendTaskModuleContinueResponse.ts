/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression, IntExpression, StringExpression } from 'adaptive-expressions';
import { BaseTeamsCacheInfoResponseDialog } from './baseTeamsCacheInfoResponseDialog';

export interface BaseSendTaskModuleContinueResponseConfiguration {
    title?: string | Expression | StringExpression;
    height?: number | Expression | IntExpression;
    width?: number | Expression | IntExpression;
    completionBotId?: string | Expression | StringExpression;
}

export abstract class BaseSendTaskModuleContinueResponse
    extends BaseTeamsCacheInfoResponseDialog
    implements BaseSendTaskModuleContinueResponseConfiguration {
    /**
     * Gets or sets the text or expression to use to generate the title of the response.
     */
    public title: StringExpression;

    /**
     * Gets or sets an optional expression for the height of the response.
     */
    public height: IntExpression;

    /**
     * Gets or sets an optional expression for the width of the response.
     */
    public width: IntExpression;

    /**
     * Gets or sets an optional expression for the Completion Bot Id of the Task Module Task Info response.
     * This is a bot App ID to send the result of the user's interaction with the task module to.
     * If specified, the bot will receive a task/submit invoke event with a JSON object in the event payload.
     */
    public completionBotId: StringExpression;
}
