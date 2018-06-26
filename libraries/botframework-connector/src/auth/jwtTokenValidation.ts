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
import { ClaimsIdentity } from './claimsIdentity';

export module JwtTokenValidation {

    /**
     * Authenticates the request and sets the service url in the set of trusted urls.
     * @param  {Activity} activity The incoming Activity from the Bot Framework or the Emulator
     * @param  {string} authHeader The Bearer token included as part of the request
     * @param  {ICredentialProvider} credentials The set of valid credentials, such as the Bot Application ID
     * @returns {Promise<ClaimsIdentity>} Promise with ClaimsIdentity for the request.
     */
    export async function authenticateRequest(activity: Activity, authHeader: string, credentials: ICredentialProvider): Promise<ClaimsIdentity> {
        if (!authHeader.trim()) {
            let isAuthDisabled = await credentials.isAuthenticationDisabled();

            if (isAuthDisabled) {
                return new ClaimsIdentity([], true);
            }

            throw new Error('Unauthorized Access. Request is not authorized');
        }

        let claimsIdentity = await this.validateAuthHeader(authHeader, credentials, activity.channelId, activity.serviceUrl);

        MicrosoftAppCredentials.trustServiceUrl(activity.serviceUrl);

        return claimsIdentity;
    }

    export async function validateAuthHeader(authHeader: string, credentials: ICredentialProvider, channelId: string, serviceUrl: string = ''): Promise<ClaimsIdentity> {
        if (!authHeader.trim()) throw new Error('\'authHeader\' required.');

        let usingEmulator = EmulatorValidation.isTokenFromEmulator(authHeader);

        if (usingEmulator) {
            return await EmulatorValidation.authenticateEmulatorToken(authHeader, credentials, channelId);//, channelId)
        }
        
        if (serviceUrl.trim()) {
            return await ChannelValidation.authenticateChannelTokenWithServiceUrl(authHeader, credentials, serviceUrl, channelId)//, channelId)
        }
        
        return await ChannelValidation.authenticateChannelToken(authHeader, credentials, channelId)//, channelId)
    }
}