/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity } from 'botframework-schema';
import { ICredentialProvider } from './credentialProvider';
import { EmulatorValidation } from './emulatorValidation';
import { ChannelValidation } from './channelValidation';
import { MicrosoftAppCredentials } from './microsoftAppCredentials';


export module JwtTokenValidation {

    /**
     * Validates the security tokens required by the Bot Framework Protocol. Throws on any exceptions.
     * @param  {Activity} activity The incoming Activity from the Bot Framework or the Emulator
     * @param  {string} authHeader The Bearer token included as part of the request
     * @param  {ICredentialProvider} credentials The set of valid credentials, such as the Bot Application ID
     * @returns {Promise} Promise acception when authorized correctly, Promise rejection when not authorized.
     */
    export async function assertValidActivity(activity: Activity, authHeader: string, credentials: ICredentialProvider): Promise<void> {
        if(!authHeader) {
            // No auth header was sent. We might be on the anonymous code path.
            let isAuthDisabled = await credentials.isAuthenticationDisabled();
            if(isAuthDisabled) {
                // We are on the anonymous code path.
                return;
            }


            // No Auth Header. Auth is required. Request is not authorized.
            throw new Error('Unauthorized Access. Request is not authorized');
        }

        let usingEmulator = EmulatorValidation.isTokenFromEmulator(authHeader);
        if (usingEmulator)
        {
            await EmulatorValidation.authenticateEmulatorToken(authHeader, credentials);
        }
        else
        {
            await ChannelValidation.authenticateChannelTokenWithServiceUrl(authHeader, credentials, <string>activity.serviceUrl);
        }

        // On the standard Auth path, we need to trust the URL that was incoming.
        MicrosoftAppCredentials.trustServiceUrl(<string>activity.serviceUrl);
    }
}