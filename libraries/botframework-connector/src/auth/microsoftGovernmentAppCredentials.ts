// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { GovernmentConstants } from './governmentConstants';
import { MicrosoftAppCredentials } from './microsoftAppCredentials';

export class MicrosoftGovernmentAppCredentials extends MicrosoftAppCredentials {
    static Empty = new MicrosoftGovernmentAppCredentials(undefined, undefined, undefined);

    /**
     * Initializes a new instance of the [MicrosoftGovernmentAppCredentials](xref:botframework-connector.MicrosoftGovernmentAppCredentials) class.
     *
     * @param {string} appId The Microsoft app ID.
     * @param {string} appPassword The Microsoft app password.
     * @param {string} oAuthScope Optional. The scope for the token.
     */
    public constructor(appId: string, appPassword: string, oAuthScope?: string) {
        super(appId, appPassword, undefined, oAuthScope ?? GovernmentConstants.ToChannelFromBotOAuthScope);
    }
}
