// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as z from 'zod';
import { Activity, ChannelAccount, InvokeResponse, RoleTypes } from 'botframework-schema';
import { BotFrameworkClient } from '../skills';
import type { ConnectorClientOptions } from '../connectorApi/models';
import { ConversationIdHttpHeaderName } from '../conversationConstants';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { USER_AGENT } from './connectorFactoryImpl';
import { WebResource } from '@azure/core-http';
import { ok } from 'assert';
import axios from 'axios';

const botFrameworkClientFetchImpl = (connectorClientOptions: ConnectorClientOptions): typeof fetch => {
    const { http: httpAgent, https: httpsAgent } = connectorClientOptions?.agentSettings ?? {
        http: undefined,
        https: undefined,
    };
    const axiosInstance = axios.create({
        httpAgent,
        httpsAgent,
        validateStatus: (): boolean => true,
    });

    return async (input, init?): Promise<Response> => {
        const url = z.string().parse(input);
        const { body, headers } = z.object({ body: z.string(), headers: z.record(z.string()).optional() }).parse(init);

        const response = await axiosInstance.post(url, body, {
            headers,
        });
        return {
            status: response.status,
            json: () => response.data,
        } as Response;
    };
};

/**
 * @internal
 * Implementation of [BotFrameworkClient](xref:botframework-connector.BotFrameworkClient).
 */
export class BotFrameworkClientImpl implements BotFrameworkClient {
    /**
     * @param credentialsFactory A [ServiceClientCredentialsFactory](xref:botframework-connector.ServiceClientCredentialsFactory) instance.
     * @param loginEndpoint The login url.
     * @param botFrameworkClientFetch A custom Fetch implementation to be used in the [BotFrameworkClient](xref:botframework-connector.BotFrameworkClient).
     * @param connectorClientOptions  A [ConnectorClientOptions](xref:botframework-connector.ConnectorClientOptions) object.
     */
    constructor(
        private readonly credentialsFactory: ServiceClientCredentialsFactory,
        private readonly loginEndpoint: string,
        private readonly botFrameworkClientFetch?: ReturnType<typeof botFrameworkClientFetchImpl>,
        private readonly connectorClientOptions?: ConnectorClientOptions
    ) {
        this.botFrameworkClientFetch ??= botFrameworkClientFetchImpl(this.connectorClientOptions);

        ok(typeof this.botFrameworkClientFetch === 'function');
    }

    private toJSON() {
        // Ignore ConnectorClientOptions, as it could contain Circular Structure behavior.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { connectorClientOptions, ...rest } = this;
        return rest;
    }

    /**
     * @template T The type of body in the InvokeResponse.
     * @param fromBotId The MicrosoftAppId of the bot sending the activity.
     * @param toBotId The MicrosoftAppId of the bot receiving the activity.
     * @param toUrl The URL of the bot receiving the activity.
     * @param serviceUrl The callback Url for the skill host.
     * @param conversationId A conversation ID to use for the conversation with the skill.
     * @param activity The Activity to send to forward.
     * @returns {Promise<InvokeResponse<T>>} A promise representing the asynchronous operation.
     */
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
