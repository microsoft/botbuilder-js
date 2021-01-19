/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Middleware, TurnContext } from 'botbuilder-core';
import * as nock from 'nock';
import { HttpRequestMock } from '../httpRequestMocks/httpRequestMock';

export class MockHttpRequestMiddleware implements Middleware {
    public constructor(httpRequestMocks: HttpRequestMock[]) {
        if (httpRequestMocks.length) {
            nock.cleanAll();
            httpRequestMocks.forEach((mock) => mock.setup());
        }
    }

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        await next();
    }
}
