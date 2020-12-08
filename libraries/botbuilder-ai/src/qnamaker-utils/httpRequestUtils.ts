/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as os from 'os';
import type { Agent } from 'http';
import { QnAMakerEndpoint } from '../qnamaker-interfaces/qnamakerEndpoint';
import { QnAMakerResult } from '../qnamaker-interfaces/qnamakerResult';

import {
    getFetch,
    isBrowserFetch,
    isNodeFetch,
    isNodeRequestInit,
    isRequestInit,
    NodeRequestInit,
    NodeResponse,
} from '../fetch';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pjson: Record<'name' | 'version', string> = require('../../package.json');

/**
 * Http request utils class.
 *
 * @summary
 * This class is helper class for all the http request operations.
 */
export class HttpRequestUtils {
    /**
     * Construct an HttpRequestUtils instance
     *
     * @param agent http agent to use for outbound requests
     */
    constructor(private readonly agent?: Agent | ((url: URL) => Agent)) {}

    /**
     * Execute Http request.
     *
     * @param {string} requestUrl Http request url.
     * @param {string} payloadBody Http request body.
     * @param {QnAMakerEndpoint} endpoint QnA Maker endpoint details.
     * @param {number} timeout (Optional)Timeout for http call
     * @returns {Promise<QnAMakerResult>} a promise that resolves to the QnAMakerResult
     */
    public async executeHttpRequest(
        requestUrl: string,
        payloadBody: string,
        endpoint: QnAMakerEndpoint,
        timeout?: number
    ): Promise<QnAMakerResult> {
        if (!requestUrl) {
            throw new TypeError('Request url cannot be null.');
        }

        if (!payloadBody) {
            throw new TypeError('Payload body cannot be null.');
        }

        if (!endpoint) {
            throw new TypeError('Payload body cannot be null.');
        }

        const fetch = await getFetch();

        const options: NodeRequestInit | RequestInit = {
            body: payloadBody,
            headers: this.getHeaders(endpoint),
            method: 'POST',
        };

        // Add node specific options if we're in a Node environment
        if (isNodeRequestInit(options)) {
            options.timeout = timeout;
            options.agent = this.agent;
        }

        // This is mostly compiler trickery
        let res: NodeResponse | Response;
        if (isNodeFetch(fetch) && isNodeRequestInit(options)) {
            res = await fetch(requestUrl, options);
        } else if (isBrowserFetch(fetch) && isRequestInit(options)) {
            res = await fetch(requestUrl, options);
        } else {
            throw new Error('unreachable');
        }

        return res.status == 204 ? this.getSuccessful204Result() : await res.json();
    }

    // Sets headers for request to QnAMaker service.
    // The [QnAMakerEndpointKey](#QnAMakerEndpoint.QnAMakerEndpointKey) is set as the value of
    // `Authorization` header for v4.0 and later of QnAMaker service.
    // Legacy QnAMaker services use the `Ocp-Apim-Subscription-Key` header for the QnAMakerEndpoint value instead.
    // [QnAMaker.getHeaders()](#QnAMaker.getHeaders) also gets the User-Agent header value.
    private getHeaders(endpoint: QnAMakerEndpoint): Record<string, string> {
        return {
            'Ocp-Apim-Subscription-Key': endpoint.endpointKey,
            Authorization: `EndpointKey ${endpoint.endpointKey}`,
            'User-Agent': this.getUserAgent(),
            'Content-Type': 'application/json',
        };
    }

    private getUserAgent(): string {
        const packageUserAgent = `${pjson.name}/${pjson.version}`;
        const platformUserAgent = `(${os.arch()}-${os.type()}-${os.release()}; Node.js,Version=${process.version})`;
        return `${packageUserAgent} ${platformUserAgent}`;
    }

    // Creates a QnAMakerResult for successful responses from QnA Maker service that return status code 204 No-Content.
    // The [Train API](https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamakerruntime/runtime/train)
    // is an example of one of QnA Maker's APIs that return a 204 status code.
    private getSuccessful204Result(): QnAMakerResult {
        return {
            questions: [],
            answer: '204 No-Content',
            score: 100,
            id: -1,
            source: null,
            metadata: [],
        };
    }
}
