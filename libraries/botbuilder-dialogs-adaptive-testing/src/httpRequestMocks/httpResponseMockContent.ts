/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { HttpResponseMock, ResponseContent, ResponseContentType } from './httpResponseMock';

export class HttpResponseMockContent {
    private readonly _contentType: ResponseContentType;
    private readonly _content: ResponseContent;

    public constructor(httpResponseMock?: HttpResponseMock) {
        this._contentType = httpResponseMock?.contentType ?? ResponseContentType.String;
        this._content = httpResponseMock?.content ?? '';
    }

    public getHttpContent(): ResponseContent {
        let content: ResponseContent = '';
        switch (this._contentType) {
            case ResponseContentType.String:
                content = this._content;
                break;
            case ResponseContentType.ByteArray:
                content =
                    typeof this._content === 'string' ? Buffer.from(this._content, 'base64').toString() : this._content;
                break;
            default:
                throw new Error(`${this._contentType} is not supported yet!`);
        }
        return content;
    }
}
