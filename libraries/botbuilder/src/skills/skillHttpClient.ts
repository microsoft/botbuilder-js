/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, BotFrameworkSkill, ConversationReference, InvokeResponse, SkillConversationIdFactoryBase, TurnContext, SkillConversationIdFactoryOptions } from 'botbuilder-core';
import { ICredentialProvider, JwtTokenValidation, GovernmentConstants, AuthenticationConstants } from 'botframework-connector';
import { BotFrameworkHttpClient } from '../botFrameworkHttpClient';

/**
 * A BotFrameworkHttpClient specialized for Skills that encapsulates Conversation ID generation.
 */
export class SkillHttpClient extends BotFrameworkHttpClient {

    private readonly conversationIdFactory: SkillConversationIdFactoryBase;
    public constructor(credentialProvider: ICredentialProvider, conversationIdFactory: SkillConversationIdFactoryBase, channelService?: string) {
        super(credentialProvider, channelService);
        if (!conversationIdFactory) {
            throw new Error('conversationIdFactory missing');
        }

        this.conversationIdFactory = conversationIdFactory;
    }


    /**
     * 
     * @param originatingAudience 
     * @param fromBotId 
     * @param toSkill 
     * @param callbackUrl 
     * @param activity 
     */
    public async postToSkill<T>(originatingAudience: string, fromBotId: string, toSkill: BotFrameworkSkill, callbackUrl: string, activity: Activity): Promise<InvokeResponse<T>>;
    public async postToSkill<T>(fromBotId: string, toSkill: BotFrameworkSkill, callbackUrl: string, activity: Activity): Promise<InvokeResponse>;
    public async postToSkill<T>(audienceOrFromBotId: string, fromBotIdOrSkill: string | BotFrameworkSkill, toSkillOrCallbackUrl: BotFrameworkSkill | string, callbackUrlOrActivity: string | Activity, activityToForward?: Activity): Promise<InvokeResponse<T>> {
        
        let originatingAudience: string;
        let fromBotId: string;
        if (typeof fromBotIdOrSkill === 'string') {
            fromBotId = fromBotIdOrSkill;
            // If fromBotIdOrSkill is a string, then audienceOrFromBotId should be a string per the overload.
            originatingAudience = audienceOrFromBotId;
        } else {
            fromBotId = audienceOrFromBotId as string;
            originatingAudience = JwtTokenValidation.isGovernment(this.channelService) ?
                GovernmentConstants.ToChannelFromBotOAuthScope :
                AuthenticationConstants.ToChannelFromBotOAuthScope;
        }

        const toSkill = typeof toSkillOrCallbackUrl === 'object' ? toSkillOrCallbackUrl : fromBotIdOrSkill as BotFrameworkSkill;
        const callbackUrl = typeof callbackUrlOrActivity === 'string' ? callbackUrlOrActivity : toSkillOrCallbackUrl as string;
        const activity = typeof activityToForward === 'object' ? activityToForward : callbackUrlOrActivity as Activity;
        
        let skillConversationId: string;
        try {
            const createIdOptions: SkillConversationIdFactoryOptions = {
                activity,
                botFrameworkSkill: toSkill,
                fromBotId: fromBotId,
                fromBotOAuthScope: originatingAudience
            };

            skillConversationId = await this.conversationIdFactory.createSkillConversationIdWithOptions(createIdOptions);
        } catch (err) {
            if (err.message === 'Not Implemented') {
                skillConversationId = await this.conversationIdFactory.createSkillConversationId(TurnContext.getConversationReference(activity) as ConversationReference);
            } else {
                throw err;
            }
        }

        return await this.postActivity<T>(fromBotId, toSkill.appId, toSkill.skillEndpoint, callbackUrl, skillConversationId, activity);
    }
}
