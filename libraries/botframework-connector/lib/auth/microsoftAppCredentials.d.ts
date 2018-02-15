/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as msrest from 'ms-rest-js';
import { BotCredentials } from './settings';
export declare class MicrosoftAppCredentials implements msrest.ServiceClientCredentials {
    private accessToken;
    private accessTokenExpires;
    private appId;
    private appPassword;
    private static refreshEndpoint;
    private static refreshScope;
    constructor(credentials: BotCredentials);
    signRequest(webResource: msrest.WebResource): Promise<msrest.WebResource>;
    private getAccessToken(cb);
}
