export * from './aadResourceUrls'
export * from './errorResponse'
export * from './innerHttpError'
export * from './modelError'
export * from './models'
export * from './tokenResponse'
export * from './tokenStatus'

import { TokenStatus } from './tokenStatus';
import http = require('http');

export interface RequestOptions {
    headers?: { [key: string]: string };
    proxyOptions?:
    {
        host: string,
        port: number,
        user: string,
        password: string
    };
}

/**
 * Contains response data for the getSignInUrl operation.
 */
export type BotSignInGetSignInUrlResponse = {
    /**
     * The parsed response body.
     */
    body: string;
  
    /**
     * The underlying HTTP response.
     */
    _response: http.IncomingMessage & {
        /**
         * The response body as text (string format)
         */
        bodyAsText: string;
  
        /**
         * The response body as parsed JSON or XML
         */
        parsedBody: string;
      };
  };

  export interface BotSignInGetSignInUrlOptionalParams extends RequestOptions {
    channelId?: string;
    codeChallenge?: string;
    emulatorUrl?: string;
    finalRedirect?: string;
}

/**
 * An interface representing TokenResponse.
 */
export interface TokenResponse {
    /**
     * @member {string} [channelId]
     */
    channelId?: string;
    /**
     * @member {string} [connectionName]
     */
    connectionName?: string;
    token?: string;
    expiration?: string;
}

/**
 * Contains response data for the getToken operation.
 */
export declare type UserTokenGetTokenResponse = TokenResponse & {
    /**
     * The underlying HTTP response.
     */
    _response: http.IncomingMessage & {
        /**
         * The response body as text (string format)
         */
        bodyAsText: string;
        /**
         * The response body as parsed JSON or XML
         */
        parsedBody: TokenResponse;
    };
};

/**
 * Optional Parameters.
 */
export interface UserTokenGetTokenOptionalParams {
    /**
     * @member {string} [channelId]
     */
    channelId?: string;
    /**
     * @member {string} [code]
     */
    code?: string;
    /**
     * @member { [key: string]: string } [headers]
     */
    headers?: { [key: string]: string };

    proxyOptions?:
    {
        host: string,
        port: number,
        user: string,
        password: string
    };
}

/**
 * @interface
 * An interface representing UserTokenGetAadTokensOptionalParams.
 * Optional Parameters.
 */
export interface UserTokenGetAadTokensOptionalParams {
    /**
     * @member {string} [channelId]
     */
    channelId?: string;
    /**
     * @member { [key: string]: string } [headers]
     */
    headers?: { [key: string]: string };

    proxyOptions?:
    {
        host: string,
        port: number,
        user: string,
        password: string
    };
}

/**
 * Optional Parameters.
 */
export interface UserTokenGetTokenStatusOptionalParams {
    /**
     * @member {string} [channelId]
     */
    channelId?: string;
    /**
     * @member {string} [include]
     */
    include?: string;
    /**
     * @member { [key: string]: string } [headers]
     */
    headers?: { [key: string]: string };
    
    proxyOptions?:
    {
        host: string,
        port: number,
        user: string,
        password: string
    };
}

/**
 * @interface
 * An interface representing UserTokenSignOutOptionalParams.
 * Optional Parameters.
 */
export interface UserTokenSignOutOptionalParams {
    connectionName?: string;
    /**
     * @member {string} [channelId]
     */
    channelId?: string;
    /**
     * @member { [key: string]: string } [headers]
     */
    headers?: { [key: string]: string };

    proxyOptions?:
    {
        host: string,
        port: number,
        user: string,
        password: string
    };
}

/**
 * Contains response data for the getAadTokens operation.
 */
export type UserTokenGetAadTokensResponse = {
    /**
     * The response body properties.
     */
    [propertyName: string]: TokenResponse;
  } & {
    /**
     * The underlying HTTP response.
     */
    _response: http.IncomingMessage & {
        /**
         * The response body as text (string format)
         */
        bodyAsText: string;
  
        /**
         * The response body as parsed JSON or XML
         */
        parsedBody: { [propertyName: string]: TokenResponse };
    };
};

/**
 * Contains response data for the signOut operation.
 */
export type UserTokenSignOutResponse = {
    /**
     * The parsed response body.
     */
    body: any;

    /**
     * The underlying HTTP response.
     */
    _response: http.IncomingMessage & {
        /**
         * The response body as text (string format)
         */
        bodyAsText: string;

        /**
         * The response body as parsed JSON or XML
         */
        parsedBody: any;
        };
};

/**
 * Contains response data for the getTokenStatus operation.
 */
export type UserTokenGetTokenStatusResponse = Array<TokenStatus> & {
    /**
     * The underlying HTTP response.
     */
    _response: http.IncomingMessage & {
        /**
         * The response body as text (string format)
         */
        bodyAsText: string;
  
        /**
         * The response body as parsed JSON or XML
         */
        parsedBody: TokenStatus[];
      };
};