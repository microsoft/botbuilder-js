import http = require('http');

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