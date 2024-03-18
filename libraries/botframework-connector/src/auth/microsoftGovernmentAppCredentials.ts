/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { GovernmentConstants } from './governmentConstants';
import { MicrosoftAppCredentials } from './microsoftAppCredentials';

/**
 * MicrosoftGovermentAppCredentials auth implementation
 */
export class MicrosoftGovernmentAppCredentials extends MicrosoftAppCredentials {
    /**
     * Initializes a new instance of the [MicrosoftGovernmentAppCredentials](xref:botframework-connector.MicrosoftGovernmentAppCredentials) class.
     *
     * @param {string} appId The Microsoft app ID.
     * @param {string} appPassword The Microsoft app password.
     * @param {string} channelAuthTenant Optional. The oauth token tenant.
     * @param {string} oAuthScope Optional. The scope for the token.
     */
    constructor(appId: string, public appPassword: string, channelAuthTenant?: string, oAuthScope?: string) {
        super(appId, appPassword, channelAuthTenant, oAuthScope);
    }

    protected GetToChannelFromBotOAuthScope(): string {
        return GovernmentConstants.ToChannelFromBotOAuthScope;
    }

    protected GetToChannelFromBotLoginUrlPrefix(): string {
        return GovernmentConstants.ToChannelFromBotLoginUrlPrefix;
    }

    protected GetDefaultChannelAuthTenant(): string {
        return GovernmentConstants.DefaultChannelAuthTenant;
    }
}
