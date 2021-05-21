// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getDefaultUserAgentValue, userAgentPolicy } from '@azure/ms-rest-js';
import { ConnectorClient } from '../connectorApi/connectorClient';
import { ConnectorClientOptions } from '../connectorApi/models';
import { ConnectorFactory } from './connectorFactory';
import type { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageInfo: Record<'name' | 'version', string> = require('../../package.json');
export const USER_AGENT = `Microsoft-BotFramework/3.1 ${packageInfo.name}/${
    packageInfo.version
} ${getDefaultUserAgentValue()} `;

// Internal
export class ConnectorFactoryImpl extends ConnectorFactory {
    constructor(
        private readonly appId: string,
        private readonly toChannelFromBotOAuthScope: string,
        private readonly loginEndpoint: string,
        private readonly validateAuthority: boolean,
        private readonly credentialFactory: ServiceClientCredentialsFactory,
        private readonly connectorClientOptions: ConnectorClientOptions = {}
    ) {
        super();
    }

    async create(serviceUrl: string, audience?: string): Promise<ConnectorClient> {
        // Use the credentials factory to create credentails specific to this particular cloud environment.
        const credentials = await this.credentialFactory.createCredentials(
            this.appId,
            audience ?? this.toChannelFromBotOAuthScope,
            this.loginEndpoint,
            this.validateAuthority
        );

        // A new connector client for making calls against this serviceUrl using credentials derived from the current appId and the specified audience.
        const options = this.getClientOptions(serviceUrl);
        return new ConnectorClient(credentials, options);
    }

    private getClientOptions(serviceUrl: string): ConnectorClientOptions {
        const { requestPolicyFactories, ...clientOptions } = this.connectorClientOptions;

        const options: ConnectorClientOptions = Object.assign({}, { baseUri: serviceUrl }, clientOptions);

        const userAgent = typeof options.userAgent === 'function' ? options.userAgent(USER_AGENT) : options.userAgent;
        const setUserAgent = userAgentPolicy({
            value: `${USER_AGENT}${userAgent ?? ''}`,
        });

        // Resolve any user request policy factories, then include our user agent via a factory policy
        options.requestPolicyFactories = (defaultRequestPolicyFactories) => {
            let defaultFactories = [];

            if (requestPolicyFactories) {
                if (typeof requestPolicyFactories === 'function') {
                    const newDefaultFactories = requestPolicyFactories(defaultRequestPolicyFactories);
                    if (newDefaultFactories) {
                        defaultFactories = newDefaultFactories;
                    }
                } else if (requestPolicyFactories) {
                    defaultFactories = [...requestPolicyFactories];
                }

                // If the user has supplied custom factories, allow them to optionally set user agent
                // before we do.
                defaultFactories = [...defaultFactories, setUserAgent];
            } else {
                // In the case that there are no user supplied factories, inject our user agent as
                // the first policy to ensure none of the default policies override it.
                defaultFactories = [setUserAgent, ...defaultRequestPolicyFactories];
            }

            return defaultFactories;
        };

        return options;
    }
}
