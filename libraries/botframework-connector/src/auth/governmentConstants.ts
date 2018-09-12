/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export module GovernmentConstants {
    /**
     * Government Channel Service property value
     */
    export const ChannelService: string = 'https://botframework.us';

    /**
     * TO CHANNEL FROM BOT: Login URL
     */
    export const ToChannelFromBotLoginUrl: string = 'https://login.microsoftonline.us/botframework.com/oauth2/v2.0/token';

    /**
     * TO CHANNEL FROM BOT: OAuth scope to request
     */
    export const ToChannelFromBotOAuthScope: string = 'https://api.botframework.us/.default';

    /**
     * TO BOT FROM CHANNEL: Token issuer
     */
    export const ToBotFromChannelTokenIssuer : string = 'https://api.botframework.us';

    /**
     * TO BOT FROM CHANNEL: OpenID metadata document for tokens coming from MSA
     */
    export const ToBotFromChannelOpenIdMetadataUrl: string = 'https://login.botframework.us/v1/.well-known/openidconfiguration';
}
