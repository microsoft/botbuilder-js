/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity } from 'botframework-schema';
import { ICredentialProvider } from './credentialProvider';
import { ClaimsIdentity } from './claimsIdentity';
export declare module JwtTokenValidation {
    /**
     * Authenticates the request and sets the service url in the set of trusted urls.
     * @param  {Activity} activity The incoming Activity from the Bot Framework or the Emulator
     * @param  {string} authHeader The Bearer token included as part of the request
     * @param  {ICredentialProvider} credentials The set of valid credentials, such as the Bot Application ID
     * @returns {Promise<ClaimsIdentity>} Promise with ClaimsIdentity for the request.
     */
    function authenticateRequest(activity: Activity, authHeader: string, credentials: ICredentialProvider): Promise<ClaimsIdentity>;
    function validateAuthHeader(authHeader: string, credentials: ICredentialProvider, channelId: string, serviceUrl?: string): Promise<ClaimsIdentity>;
}
