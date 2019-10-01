import http = require('http');
import { ResourceResponse } from '../resourceResponse';

/**
 * Contains response data for the ConversationResourceResponse.
 */
export type useResourceResponse = ResourceResponse & {
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
        parsedBody: ResourceResponse;
    };
};