/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { HttpResponseMessage, HttpResponseMock, ResponseStatusCode } from './httpResponseMock';
import { HttpResponseMockContent } from './httpResponseMockContent';

export class HttpResponseMockMessage {
    private readonly _mock: HttpResponseMock;
    private readonly _content: HttpResponseMockContent;

    public constructor(httpResponseMock?: HttpResponseMock) {
        this._mock = httpResponseMock ?? { content: '' };
        this._content = new HttpResponseMockContent(this._mock);
    }

    public getMessage(): HttpResponseMessage {
        let statusCode = ResponseStatusCode.OK;
        if (typeof this._mock.statusCode === 'number') {
            statusCode = this._mock.statusCode;
        } else if (typeof this._mock.statusCode === 'string') {
            statusCode = (ResponseStatusCode as unknown)[this._mock.statusCode] ?? ResponseStatusCode.OK;
        }
        return {
            statusCode,
            content: this._content.getHttpContent(),
        };
    }
}
