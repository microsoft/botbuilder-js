import http = require('http');
import { TokenResponse } from "..";

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