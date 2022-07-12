/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TestAdapter } from 'botbuilder-core';
import { Configurable, Converter } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

/**
 * Interface for mocking user token flows.
 */
export abstract class UserTokenMock extends Configurable {
    /**
     * Method to setup this mock for an adapter.
     */
    abstract setup(adapter: TestAdapter): void;
}

/**
 * The type converters for UserTokenMock.
 */
export class UserTokenMocksConverter implements Converter<string[], UserTokenMock[]> {
    constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    convert(value: (string | UserTokenMock)[]): UserTokenMock[] {
        return value.map((item: string | UserTokenMock) => {
            if (typeof item === 'string') {
                const userTokenMock = this._resourceExplorer.loadType<UserTokenMock>(`${item}.dialog`);
                if (userTokenMock) {
                    return userTokenMock;
                } else {
                    return this._resourceExplorer.loadType<UserTokenMock>(item);
                }
            } else {
                const kind = item['$kind'];
                return this._resourceExplorer.buildType<UserTokenMock, UserTokenMock>(kind, item);
            }
        });
    }
}
