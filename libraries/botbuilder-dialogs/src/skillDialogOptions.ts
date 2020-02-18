/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BotFrameworkHttpClient, SkillConversationIdFactoryBase } from 'botbuilder'; // bad import

export interface SkillDialogOptions {
    
    botId: string;

    skillClient: BotFrameworkHttpClient;

    skillHostEndpoint: string;

    conversationIdFactory: SkillConversationIdFactoryBase;
}
