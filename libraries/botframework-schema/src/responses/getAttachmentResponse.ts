import http = require('http');

export type GetAttachmentResponse = {
    /**
     * BROWSER ONLY
     *
     * The response body as a browser Blob.
     * Always undefined in node.js.
     */
    blobBody: Promise<Blob>;

    /**
     * NODEJS ONLY
     *
     * The response body as a node.js Readable stream.
     * Always undefined in the browser.
     */
    readableStreamBody: NodeJS.ReadableStream;

    /**
     * The underlying HTTP response.
     */
    _response: http.IncomingMessage;
};