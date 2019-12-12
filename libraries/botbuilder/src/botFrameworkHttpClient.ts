/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import axios from 'axios';
import { Activity } from 'botbuilder-core';
import {
    AuthenticationConstants,
    GovernmentConstants,
    ICredentialProvider,
    JwtTokenValidation,
    MicrosoftAppCredentials
} from 'botframework-connector';

import { InvokeResponse, USER_AGENT } from './botFrameworkAdapter';

/**
 * HttpClient for calling skills from a Node.js BotBuilder V4 SDK bot.
 */
export class BotFrameworkHttpClient {
    /**
     * Cache for appCredentials to speed up token acquisition (a token is not requested unless is expired)
     * AppCredentials are cached using appId + scope (this last parameter is only used if the app credentials are used to call a skill)
     */
    private static readonly appCredentialMapCache: Map<string, MicrosoftAppCredentials> = new Map<string, MicrosoftAppCredentials>();

    constructor(private readonly credentialProvider: ICredentialProvider, private readonly channelService?: string) {
        if (!this.credentialProvider) {
            throw new Error('BotFrameworkHttpClient(): missing credentialProvider');
        }
        if (!this.channelService) {
            this.channelService = process.env[AuthenticationConstants.ChannelService];
        }
    }

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
    public async postActivity(fromBotId: string, toBotId: string, toUrl: string, serviceUrl: string, conversationId: string, activity: Activity): Promise<InvokeResponse> {
        const appCredentials = await this.getAppCredentials(fromBotId, toBotId);
        if (!appCredentials) {
            throw new Error('BotFrameworkHttpClient.postActivity(): Unable to get appCredentials to connect to the skill');
        }

        // Get token for the skill call
        const token = appCredentials.appId === '' && appCredentials.appPassword === '' ? null : await appCredentials.getToken();

        // Capture current activity settings before changing them.
        // TODO: DO we need to set the activity ID? (events that are created manually don't have it).
        const originalConversationId = activity.conversation.id;
        const originalServiceUrl = activity.serviceUrl;
        const originalCallerId = activity.callerId;
        try {
            activity.conversation.id = conversationId;
            activity.serviceUrl = serviceUrl;
            activity.callerId = fromBotId;
            const config = {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'User-Agent': USER_AGENT
                }
            };

            if (token) {
                config.headers['Authorization'] = `Bearer ${ token }`;
            }
            
            const response = await axios.post(toUrl, activity, config);
            const invokeResponse: InvokeResponse = { status: response.status, body: response.data };

            return invokeResponse;
        } finally {
            // Restore activity properties.
            activity.conversation.id = originalConversationId;
            activity.serviceUrl = originalServiceUrl;
            activity.callerId = originalCallerId;
        }
    }

    /**
     * Gets the application credentials. App Credentials are cached so as to ensure we are not refreshing
     * token every time.
     * @private
     * @param appId The application identifier (AAD Id for the bot).
     * @param oAuthScope The scope for the token, skills will use the Skill App Id.
     */
    private async getAppCredentials(appId: string, oAuthScope?: string): Promise<MicrosoftAppCredentials> {
        if (!appId) {
            return new MicrosoftAppCredentials('', '');
        }

        const cacheKey = `${ appId }${ oAuthScope }`;
        let appCredentials = BotFrameworkHttpClient.appCredentialMapCache.get(cacheKey);
        if (appCredentials) {
            return appCredentials;
        }

        const appPassword = await this.credentialProvider.getAppPassword(appId);
        if (JwtTokenValidation.isGovernment(this.channelService)) {
            appCredentials = new MicrosoftAppCredentials(appId, appPassword, this.channelService, oAuthScope);
            appCredentials.oAuthEndpoint = GovernmentConstants.ToChannelFromBotLoginUrl;
            appCredentials.oAuthScope = GovernmentConstants.ToChannelFromBotOAuthScope;
        } else {
            appCredentials = new MicrosoftAppCredentials(appId, appPassword, this.channelService, oAuthScope);
        }

        // Cache the credentials for later use
        BotFrameworkHttpClient.appCredentialMapCache.set(cacheKey, appCredentials);
        return appCredentials;
    }
}
