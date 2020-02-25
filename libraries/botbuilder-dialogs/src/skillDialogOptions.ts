/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BotFrameworkClient, SkillConversationIdFactoryBase } from 'botbuilder-core';

export interface SkillDialogOptions {
    
    botId: string;

    skillClient: BotFrameworkClient;

    skillHostEndpoint: string;

    conversationIdFactory: SkillConversationIdFactoryBase;
}
