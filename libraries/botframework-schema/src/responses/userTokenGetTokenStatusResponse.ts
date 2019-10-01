import { TokenStatus } from "..";
import http = require('http');

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