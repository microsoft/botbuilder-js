/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { HttpResponseMessage, HttpResponseMock, ResponseStatusCode } from './httpResponseMock';
import { HttpResponseMockContent } from './httpResponseMockContent';

/**
 * Convert and store the actual data of HttpResponseMock.
 */
export class HttpResponseMockMessage {
    private readonly _mock: HttpResponseMock;
    private readonly _content: HttpResponseMockContent;

    /**
     * Initializes a new instance of the HttpResponseMockMessage class.
     *
     * @param {HttpResponseMock} httpResponseMock The mock that provides data.
     */
    constructor(httpResponseMock?: HttpResponseMock) {
        this._mock = httpResponseMock ?? { content: '' };
        this._content = new HttpResponseMockContent(this._mock);
    }

    /**
     * Gets a new HttpResponseMessage.
     *
     * @returns {HttpResponseMessage} A new HttpResponseMessage.
     */
    getMessage(): HttpResponseMessage {
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
