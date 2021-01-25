/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Configurable, Converter } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

export abstract class HttpRequestMock extends Configurable {
    public abstract setup(): void;
}

/**
 * The type converters for UserTokenMock.
 */
export class HttpRequestMocksConverter implements Converter<string[], HttpRequestMock[]> {
    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public convert(value: string[] | HttpRequestMock[]): HttpRequestMock[] {
        const httpRequestMocks: HttpRequestMock[] = [];
        value.forEach((item: string | HttpRequestMock) => {
            if (typeof item === 'string') {
                const httpRequestMock = this._resourceExplorer.loadType<HttpRequestMock>(`${item}.dialog`);
                if (httpRequestMock) {
                    httpRequestMocks.push(httpRequestMock);
                } else {
                    httpRequestMocks.push(this._resourceExplorer.loadType<HttpRequestMock>(item));
                }
            } else {
                const kind = item['$kind'];
                httpRequestMocks.push(this._resourceExplorer.buildType<HttpRequestMock, HttpRequestMock>(kind, item));
            }
        });
        return httpRequestMocks;
    }
}
