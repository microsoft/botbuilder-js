/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity } from 'botframework-schema';
import { ICredentialProvider } from './credentialProvider';
export declare module JwtTokenValidation {
    /**
     * Validates the security tokens required by the Bot Framework Protocol. Throws on any exceptions.
     * @param  {Activity} activity The incoming Activity from the Bot Framework or the Emulator
     * @param  {string} authHeader The Bearer token included as part of the request
     * @param  {ICredentialProvider} credentials The set of valid credentials, such as the Bot Application ID
     * @returns {Promise} Promise acception when authorized correctly, Promise rejection when not authorized.
     */
    function assertValidActivity(activity: Activity, authHeader: string, credentials: ICredentialProvider): Promise<void>;
}
