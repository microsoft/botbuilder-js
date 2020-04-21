/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import axios from 'axios';
import { Activity, BotFrameworkClient, InvokeResponse } from 'botbuilder-core';
import {
    AuthenticationConstants,
    AppCredentials,
    GovernmentConstants,
    ICredentialProvider,
    JwtTokenValidation,
    MicrosoftAppCredentials
} from 'botframework-connector';

import { USER_AGENT } from './botFrameworkAdapter';

/**
 * HttpClient for calling skills from a Node.js BotBuilder V4 SDK bot.
 */
export class BotFrameworkHttpClient implements BotFrameworkClient {

    protected readonly channelService: string;

    /**
     * Cache for appCredentials to speed up token acquisition (a token is not requested unless is expired)
     * AppCredentials are cached using appId + scope (this last parameter is only used if the app credentials are used to call a skill)
     */
    private static readonly appCredentialMapCache: Map<string, AppCredentials> = new Map<string, AppCredentials>();
    private readonly credentialProvider: ICredentialProvider;

    public constructor(credentialProvider: ICredentialProvider, channelService?: string) {
        if (!credentialProvider) {
            throw new Error('BotFrameworkHttpClient(): missing credentialProvider');
        }

        this.credentialProvider = credentialProvider;
        this.channelService = channelService || process.env[AuthenticationConstants.ChannelService];
    }

    /**
     * Forwards an activity to a another bot.
     * @remarks
     * 
     * @template T The type of body in the InvokeResponse. 
     * @param fromBotId The MicrosoftAppId of the bot sending the activity.
     * @param toBotId The MicrosoftAppId of the bot receiving the activity.
     * @param toUrl The URL of the bot receiving the activity.
     * @param serviceUrl The callback Url for the skill host.
     * @param conversationId A conversation ID to use for the conversation with the skill.
     * @param activity Activity to forward.
     */
    public async postActivity<T>(fromBotId: string, toBotId: string, toUrl: string, serviceUrl: string, conversationId: string, activity: Activity): Promise<InvokeResponse<T>>
    public async postActivity(fromBotId: string, toBotId: string, toUrl: string, serviceUrl: string, conversationId: string, activity: Activity): Promise<InvokeResponse>
    public async postActivity<T = any>(fromBotId: string, toBotId: string, toUrl: string, serviceUrl: string, conversationId: string, activity: Activity): Promise<InvokeResponse<T>> {
        const appCredentials = await this.getAppCredentials(fromBotId, toBotId);
        if (!appCredentials) {
            throw new Error('BotFrameworkHttpClient.postActivity(): Unable to get appCredentials to connect to the skill');
        }

        if (!activity) {
            throw new Error('BotFrameworkHttpClient.postActivity(): missing activity');
        }

        if (activity.conversation === undefined) {
            throw new Error('BotFrameworkHttpClient.postActivity(): Activity must have a ConversationReference');
        }

        // Get token for the skill call
        const token = appCredentials.appId ? await appCredentials.getToken() : null;

        // Capture current activity settings before changing them.
        // TODO: DO we need to set the activity ID? (events that are created manually don't have it).
        const originalConversationId = activity.conversation.id;
        const originalServiceUrl = activity.serviceUrl;
        const originalRelatesTo = activity.relatesTo;
        const originalRecipient = activity.recipient;
        try {
            activity.relatesTo = {
                serviceUrl: activity.serviceUrl,
                activityId: activity.id,
                channelId: activity.channelId,
                conversation: {
                    id: activity.conversation.id,
                    name: activity.conversation.name,
                    conversationType: activity.conversation.conversationType,
                    aadObjectId: activity.conversation.aadObjectId,
                    isGroup: activity.conversation.isGroup,
                    properties: activity.conversation.properties,
                    role: activity.conversation.role,
                    tenantId: activity.conversation.tenantId
                },
                bot: null
            };
            activity.conversation.id = conversationId;
            activity.serviceUrl = serviceUrl;

            // Fixes: https://github.com/microsoft/botframework-sdk/issues/5785
            if (!activity.recipient) {
                activity.recipient = {} as any;
            }

            const config = {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'User-Agent': USER_AGENT
                },
                validateStatus: (): boolean => true
            };

            if (token) {
                config.headers['Authorization'] = `Bearer ${ token }`;
            }
            
            const response = await axios.post(toUrl, activity, config);
            const invokeResponse: InvokeResponse<T> = { status: response.status, body: response.data };

            return invokeResponse;
        } finally {
            // Restore activity properties.
            activity.conversation.id = originalConversationId;
            activity.serviceUrl = originalServiceUrl;
            activity.relatesTo = originalRelatesTo;
            activity.recipient = originalRecipient;
        }
    }

    protected async buildCredentials(appId: string, oAuthScope?: string): Promise<AppCredentials> {
        const appPassword = await this.credentialProvider.getAppPassword(appId);
        let appCredentials;        
        if (JwtTokenValidation.isGovernment(this.channelService)) {
            appCredentials = new MicrosoftAppCredentials(appId, appPassword, undefined, oAuthScope);
            appCredentials.oAuthEndpoint = GovernmentConstants.ToChannelFromBotLoginUrl;
        } else {
            appCredentials = new MicrosoftAppCredentials(appId, appPassword, undefined, oAuthScope);
        }
        return appCredentials;
    }

    /**
     * Gets the application credentials. App Credentials are cached so as to ensure we are not refreshing
     * token every time.
     * @private
     * @param appId The application identifier (AAD Id for the bot).
     * @param oAuthScope The scope for the token, skills will use the Skill App Id.
     */
    private async getAppCredentials(appId: string, oAuthScope?: string): Promise<AppCredentials> {
        if (!appId) {
            return new MicrosoftAppCredentials('', '');
        }

        const cacheKey = `${ appId }${ oAuthScope }`;
        let appCredentials = BotFrameworkHttpClient.appCredentialMapCache.get(cacheKey);
        if (appCredentials) {
            return appCredentials;
        }

        // Credentials not found in cache, build them
        appCredentials = await this.buildCredentials(appId, oAuthScope) as MicrosoftAppCredentials;

        // Cache the credentials for later use
        BotFrameworkHttpClient.appCredentialMapCache.set(cacheKey, appCredentials);
        return appCredentials;
    }
}
