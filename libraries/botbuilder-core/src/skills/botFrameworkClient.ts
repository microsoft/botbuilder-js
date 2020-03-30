/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botframework-schema';
import { InvokeResponse } from '../invokeResponse';

export interface BotFrameworkClient {   
    /**
     * Forwards an activity to a another bot.
     * @remarks
     * 
     * @param fromBotId The MicrosoftAppId of the bot sending the activity.
     * @param toBotId The MicrosoftAppId of the bot receiving the activity.
     * @param toUrl The URL of the bot receiving the activity.
     * @param serviceUrl The callback Url for the skill host.
     * @param conversationId A conversation ID to use for the conversation with the skill.
     * @param activity Activity to forward.
     */
    postActivity: (<T>(fromBotId: string, toBotId: string, toUrl: string, serviceUrl: string, conversationId: string, activity: Activity) => Promise<InvokeResponse<T>>) | ((fromBotId: string, toBotId: string, toUrl: string, serviceUrl: string, conversationId: string, activity: Activity) => Promise<InvokeResponse>);
}
