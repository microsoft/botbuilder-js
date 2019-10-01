import http = require('http');
import { AttachmentInfo } from '../attachmentInfo';

export type GetAttachmentInfoResponse = AttachmentInfo & {
    /**
     * The underlying HTTP response.
     */
    _response: http.IncomingMessage & {
        /*
         * The response body as text (string format)
         */
        bodyAsText: string;
        /*
         * The response body as parsed JSON or XML
         */
        parsedBody: AttachmentInfo;
    };
};


