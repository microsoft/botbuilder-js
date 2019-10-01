import { TokenResponse } from "..";
import http = require('http');

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