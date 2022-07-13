/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Middleware, TurnContext } from 'botbuilder-core';
import { HttpMethod } from 'botbuilder-dialogs-adaptive';
import { ClientRequest } from 'http';
import * as nock from 'nock';
import * as parse from 'url-parse';
import { HttpRequestMock } from '../httpRequestMocks/httpRequestMock';
import { HttpRequestSequenceMock } from '../httpRequestMocks/httpRequestSequenceMock';
import { HttpResponseMessage } from '../httpRequestMocks/httpResponseMock';

/**
 * Turn state key for MockHttpRequestMiddleware.
 */
export const MockHttpRequestMiddlewareKey = Symbol('MockHttpRequestMiddleware');

/**
 * Http request message.
 */
export type HttpRequestMessage = ClientRequest & {
    headers: Record<string, string>;
};

/**
 * Fallback function.
 */
export type FallbackFunc = (request: HttpRequestMessage) => HttpResponseMessage | Promise<HttpResponseMessage>;

/**
 * Middleware to mock http requests with an adapter.
 */
export class MockHttpRequestMiddleware implements Middleware {
    /**
     * Initializes a new instance of the [MockHttpRequestMiddleware](xref:botbuilder-dialogs-adaptive-testing.MockHttpRequestMiddleware) class.
     *
     * @param {HttpRequestMock[]} httpRequestMocks Mocks to use.
     */
    constructor(httpRequestMocks: HttpRequestMock[] = []) {
        httpRequestMocks.forEach((mock) => mock.setup());
        this._httpRequestMocks = httpRequestMocks;
    }

    /**
     * @param context The context object for this turn.
     * @param next The delegate to call to continue the bot middleware pipeline.
     */
    async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        context.turnState.set(MockHttpRequestMiddlewareKey, this);
        await next();
    }

    /**
     * Set fallback.
     *
     * @param {FallbackFunc} fallback New fallback or undefined.
     */
    setFallback(fallback?: FallbackFunc): void {
        nock.cleanAll();
        this._httpRequestMocks.forEach((mock) => mock.setup());

        if (!fallback) {
            return;
        }

        const origins = new Set<string>(
            this._httpRequestMocks
                .filter((mock) => mock instanceof HttpRequestSequenceMock)
                .map((mock: HttpRequestSequenceMock) => parse(mock.url).origin)
        );

        // call fallback functions if mocks not catched
        origins.forEach((origin) => {
            this._httpMethods.forEach((method) => {
                nock(origin)
                    .intercept(/.*/, method)
                    .reply(async function (_uri: string, _body: nock.Body) {
                        if (fallback) {
                            const message = await fallback(this.req);
                            return [message.statusCode, message.content];
                        }
                        return [404, ''];
                    })
                    .persist();
            });
        });

        // final fallbacks
        this._httpMethods.forEach((method) => {
            nock(/.*/)
                .intercept(/.*/, method)
                .reply(async function (_uri: string, _body: nock.Body) {
                    if (fallback) {
                        const message = await fallback(this.req);
                        return [message.statusCode, message.content];
                    }
                    return [404, ''];
                })
                .persist();
        });
    }

    private _httpRequestMocks: HttpRequestMock[];

    private _httpMethods = [HttpMethod.GET, HttpMethod.PATCH, HttpMethod.DELETE, HttpMethod.POST, HttpMethod.PUT];
}
