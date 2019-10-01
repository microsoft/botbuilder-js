import http = require('http');
import { ConversationsResult  } from '../ConversationsResult';

export type ConversationsResponse = ConversationsResult  & {
    /**
     * The response body as text (string format)
     */
    _response: http.IncomingMessage & {
        /**
         * The response body as text (string format)
         */
        bodyAsText: string;

        /**
         * The response body as parsed JSON or XML
         */
        parsedBody: ConversationsResult ;
    };
};
