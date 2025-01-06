// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConnectorClient } from '../connectorApi/connectorClient';
import { ConnectorClientOptions } from '../connectorApi/models';
import { ConnectorFactory } from './connectorFactory';
import type { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageInfo: Record<'name' | 'version', string> = require('../../package.json');
export const USER_AGENT = `Microsoft-BotFramework/3.1 ${packageInfo.name}/${packageInfo.version} `;

/**
 * @internal
 * Implementation of [ConnectorFactory](xref:botframework-connector.ConnectorFactory).
 */
export class ConnectorFactoryImpl extends ConnectorFactory {
    /**
     * @param appId The AppID.
     * @param toChannelFromBotOAuthScope The to Channel from bot oauth scope.
     * @param loginEndpoint The login url.
     * @param validateAuthority The validate authority value to use.
     * @param credentialFactory A ServiceClientCredentialsFactory to use.
     * @param connectorClientOptions The [ConnectorClientOptions](xref:botframework-connector.ConnectorClientOptions) to use when creating ConnectorClients.
     */
    constructor(
        private readonly appId: string,
        private readonly toChannelFromBotOAuthScope: string,
        private readonly loginEndpoint: string,
        private readonly validateAuthority: boolean,
        private readonly credentialFactory: ServiceClientCredentialsFactory,
        private readonly connectorClientOptions: ConnectorClientOptions = {},
    ) {
        super();
    }

    /**
     * @param serviceUrl The client's service URL.
     * @param audience The audience to use for outbound communication. It will vary by cloud environment.
     * @returns The new instance of the ConnectorClient class.
     */
    async create(serviceUrl: string, audience?: string): Promise<ConnectorClient> {
        // Use the credentials factory to create credentails specific to this particular cloud environment.
        const credentials = await this.credentialFactory.createCredentials(
            this.appId,
            audience ?? this.toChannelFromBotOAuthScope,
            this.loginEndpoint,
            this.validateAuthority,
        );

        const userAgent =
            typeof this.connectorClientOptions?.userAgent === 'function'
                ? this.connectorClientOptions?.userAgent(USER_AGENT)
                : this.connectorClientOptions?.userAgent;
        const options: ConnectorClientOptions = {
            ...this.connectorClientOptions,
            baseUri: serviceUrl,
            userAgent: `${USER_AGENT} ${userAgent ?? ''}`,
        };

        options.requestPolicyFactories = [
            {
                create: (nextPolicy) => ({
                    sendRequest: (httpRequest) => {
                        if (!httpRequest.headers.contains('accept')) {
                            httpRequest.headers.set('accept', '*/*');
                        }
                        return nextPolicy.sendRequest(httpRequest);
                    },
                }),
            },
        ];

        return new ConnectorClient(credentials, options);
    }
}
