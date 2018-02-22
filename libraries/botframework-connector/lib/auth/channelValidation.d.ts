/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { VerifyOptions } from 'jsonwebtoken';
import { ICredentialProvider } from './credentialProvider';
import { ClaimsIdentity } from './claimsIdentity';
export declare module ChannelValidation {
    /**
     * TO BOT FROM CHANNEL: Token validation parameters when connecting to a bot
     */
    const ToBotFromChannelTokenValidationParameters: VerifyOptions;
    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework Service.
     * A token issued by the Bot Framework emulator will FAIL this check.
     * @param  {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @param  {string} serviceUrl The ServiceUrl Claim value that must match in the identity.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    function authenticateChannelTokenWithServiceUrl(authHeader: string, credentials: ICredentialProvider, serviceUrl: string): Promise<ClaimsIdentity>;
    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework Service.
     * A token issued by the Bot Framework emulator will FAIL this check.
     * @param  {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    function authenticateChannelToken(authHeader: string, credentials: ICredentialProvider): Promise<ClaimsIdentity>;
}
