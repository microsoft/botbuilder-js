/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { HttpMethod } from 'botbuilder-dialogs-adaptive';
import * as nock from 'nock';
import * as parse from 'url-parse';
import { HttpRequestMock } from './httpRequestMock';
import { HttpResponseMock } from './httpResponseMock';
import { SequenceResponseManager } from './sequenceResponseManager';

/**
 * Type for how body matches against request's body.
 */
export enum BodyMatchType {
    /**
     * Exact match.
     */
    Exact = 'Exact',
    /**
     * Match as a part.
     */
    Partial = 'Partial',
}

/**
 * Configuration for a HttpRequestSequenceMock.
 */
export interface HttpRequestSequenceMockConfiguration {
    method?: string | HttpMethod;
    url?: string;
    matchType?: string | BodyMatchType;
    body?: string;
    responses?: HttpResponseMock[];
}

/**
 * Mock http request in sequence order. The last response will be repeated.
 */
export class HttpRequestSequenceMock extends HttpRequestMock implements HttpRequestSequenceMockConfiguration {
    /**
     * The type of request.
     */
    static $kind = 'Microsoft.Test.HttpRequestSequenceMock';

    /**
     * Gets or sets the http method to match. Match to any method if not defined.
     */
    public method: HttpMethod;

    /**
     * Gets or sets the url to match.
     */
    public url: string;

    /**
     * Gets or sets the match type for body.
     */
    public matchType = BodyMatchType.Partial;

    /**
     * Gets or sets the body to match against request's body.
     */
    public body = '';

    /**
     * Gets the sequence of responses to reply. The last one will be repeated.
     */
    public responses: HttpResponseMock[] = [];

    /**
     * Configures the initial conditions.
     */
    public setup(): void {
        if (this.body && (this.method === HttpMethod.DELETE || this.method === HttpMethod.GET)) {
            throw new Error("GET and DELETE don't support matching body!");
        }
        const response = new SequenceResponseManager(this.responses);
        const url = parse(this.url);
        let path = this.url.substr(url.origin.length);
        path = path.startsWith('/') ? path : '/' + path;
        if (this.method) {
            nock(url.origin)
                .intercept(path, this.method, this._matchContent.bind(this))
                .reply((_uri, _requestBody) => {
                    const message = response.getMessage();
                    return [message.statusCode, message.content];
                })
                .persist();
        } else {
            this._httpMethods.forEach((method) => {
                nock(url.origin)
                    .intercept(path, method, this._matchContent.bind(this))
                    .reply((_uri, _requestBody) => {
                        const message = response.getMessage();
                        return [message.statusCode, message.content];
                    })
                    .persist();
            });
        }
    }

    private _httpMethods = [HttpMethod.GET, HttpMethod.PATCH, HttpMethod.DELETE, HttpMethod.POST, HttpMethod.PUT];

    private _matchContent(body: unknown): boolean {
        const content: string = typeof body === 'string' ? body : JSON.stringify(body, undefined, 2);
        if (this.matchType === BodyMatchType.Exact) {
            return content === this.body;
        } else {
            return content.indexOf(this.body) >= 0;
        }
    }
}
