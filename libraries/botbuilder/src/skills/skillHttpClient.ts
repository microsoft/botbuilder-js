/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ConversationReference, TurnContext } from 'botbuilder-core';
import { ICredentialProvider } from 'botframework-connector';
import { InvokeResponse } from '../botFrameworkAdapter';
import { BotFrameworkHttpClient } from '../botFrameworkHttpClient';
import { SkillConversationIdFactoryBase } from './skillConversationIdFactoryBase';    

/**
 * A BotFrameworkHttpClient specialized for Skills that encapsulates Conversation ID generation.
 */
export class SkillHttpClient extends BotFrameworkHttpClient {
    constructor(credentialProvider: ICredentialProvider, private readonly conversationIdFactory: SkillConversationIdFactoryBase, channelService?: string) {
        super(credentialProvider, channelService);
    }

    public async postToSkill(fromBotId: string, toSkillId: string, toSkillUrl: string, serviceUrl: string, activity: Activity): Promise<InvokeResponse> {
        const skillConversationId = await this.conversationIdFactory.createSkillConversationId(TurnContext.getConversationReference(activity) as ConversationReference);
        return await super.postActivity(fromBotId, toSkillId, toSkillUrl, serviceUrl, skillConversationId, activity);
    }
}
