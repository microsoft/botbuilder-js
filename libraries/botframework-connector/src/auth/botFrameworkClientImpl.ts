// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import { Activity, ChannelAccount, InvokeResponse, RoleTypes } from 'botframework-schema';
import { BotFrameworkClient } from '../skills';
import { ConversationIdHttpHeaderName } from '../conversationConstants';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { USER_AGENT } from './connectorFactoryImpl';
import { WebResource } from '@azure/ms-rest-js';
import { assert } from 'botbuilder-stdlib';

const botFrameworkClientFetchImpl = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const config = {
        headers: init.headers as Record<string, string>,
        validateStatus: (): boolean => true,
    };

    assert.string(input, ['input']);
    assert.string(init.body, ['init']);
    const activity = JSON.parse(init.body) as Activity;

    const response = await axios.post(input, activity, config);
    return {
        status: response.status,
        json: async () => response.data,
    } as Response;
};

// Internal
export class BotFrameworkClientImpl implements BotFrameworkClient {
    constructor(
        private readonly credentialsFactory: ServiceClientCredentialsFactory,
        private readonly loginEndpoint: string,
        private readonly botFrameworkClientFetch: (
            input: RequestInfo,
            init?: RequestInit
        ) => Promise<Response> = botFrameworkClientFetchImpl
    ) {
        assert.maybeFunc(botFrameworkClientFetch, ['botFrameworkClientFetch']);
    }

    async postActivity<T>(
        fromBotId: string,
        toBotId: string,
        toUrl: string,
        serviceUrl: string,
        conversationId: string,
        activity: Activity
    ): Promise<InvokeResponse<T>> {
        assert.maybeString(fromBotId, ['fromBotId']);
        assert.maybeString(toBotId, ['toBotId']);
        assert.string(toUrl, ['toUrl']);
        assert.string(serviceUrl, ['serviceUrl']);
        assert.string(conversationId, ['conversationId']);
        assert.object(activity, ['activity']);

        const credentials = await this.credentialsFactory.createCredentials(
            fromBotId,
            toBotId,
            this.loginEndpoint,
            true
        );

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
                    tenantId: activity.conversation.tenantId,
                },
                bot: null,
            };
            activity.conversation.id = conversationId;
            activity.serviceUrl = serviceUrl;

            // Fixes: https://github.com/microsoft/botframework-sdk/issues/5785
            if (!activity.recipient) {
                activity.recipient = {} as ChannelAccount;
            }
            activity.recipient.role = RoleTypes.Skill;

            const webRequest = new WebResource(toUrl, 'POST', JSON.stringify(activity), undefined, {
                Accept: 'application/json',
                [ConversationIdHttpHeaderName]: conversationId,
                'Content-Type': 'application/json',
                'User-Agent': USER_AGENT,
            });
            const request = await credentials.signRequest(webRequest);

            const config: RequestInit = {
                body: request.body,
                headers: request.headers.rawHeaders(),
            };
            const response = await this.botFrameworkClientFetch(request.url, config);

            return { status: response.status, body: await response.json() };
        } finally {
            // Restore activity properties.
            activity.conversation.id = originalConversationId;
            activity.serviceUrl = originalServiceUrl;
            activity.relatesTo = originalRelatesTo;
            activity.recipient = originalRecipient;
        }
    }
}
