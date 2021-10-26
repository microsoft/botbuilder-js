// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as z from 'zod';
import axios from 'axios';
import { Activity, ChannelAccount, InvokeResponse, RoleTypes } from 'botframework-schema';
import { BotFrameworkClient } from '../skills';
import { ConversationIdHttpHeaderName } from '../conversationConstants';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { USER_AGENT } from './connectorFactoryImpl';
import { WebResource } from '@azure/ms-rest-js';
import { ok } from 'assert';

const botFrameworkClientFetchImpl: typeof fetch = async (input, init) => {
    const url = z.string().parse(input);
    const { body, headers } = z.object({ body: z.string(), headers: z.record(z.string()).optional() }).parse(init);

    const response = await axios.post(url, JSON.parse(body), {
        headers,
        validateStatus: () => true,
    });

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
        private readonly botFrameworkClientFetch = botFrameworkClientFetchImpl
    ) {
        ok(typeof botFrameworkClientFetch === 'function');
    }

    async postActivity<T>(
        fromBotId: string,
        toBotId: string,
        toUrl: string,
        serviceUrl: string,
        conversationId: string,
        activity: Activity
    ): Promise<InvokeResponse<T>> {
        z.object({
            fromBotId: z.string().optional(),
            toBotId: z.string().optional(),
            toUrl: z.string(),
            serviceUrl: z.string(),
            conversationId: z.string(),
            activity: z.record(z.unknown()),
        }).parse({
            fromBotId,
            toBotId,
            toUrl,
            serviceUrl,
            conversationId,
            activity,
        });

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
