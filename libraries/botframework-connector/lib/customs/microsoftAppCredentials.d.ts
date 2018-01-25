import * as msRest from 'ms-rest';
import { BotCredentials } from './settings';

export declare class MicrosoftAppCredentials implements msRest.ServiceClientCredentials {
    private accessToken;
    private accessTokenExpires;
    private appId;
    private appPassword;
    private static refreshEndpoint;
    private static refreshScope;
    constructor(credentials: BotCredentials);
    signRequest(webResource: msRest.WebResource, callback: {(err: Error): void;}): void;
    private getAccessToken(callback);
}