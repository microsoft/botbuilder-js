import http = require('http');
import { ConversationResourceResponse } from '../conversationResourceResponse';

export type CreateConversationResponse =  {
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
        parsedBody: ConversationResourceResponse;
    };
};
