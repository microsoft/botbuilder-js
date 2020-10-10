/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TestAdapter } from 'botbuilder-core';
import { Converter } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

/**
 * Interface for mocking user token flows.
 */
export interface UserTokenMock {
    /**
     * Method to setup this mock for an adapter.
     */
    setup(adapter: TestAdapter): void;
}

/**
 * The type converters for UserTokenMock.
 */
export class UserTokenMocksConverter implements Converter<string[], UserTokenMock[]> {
    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public convert(value: string[] | UserTokenMock[]): UserTokenMock[] {
        const userTokenMocks: UserTokenMock[] = [];
        value.forEach((item: string | UserTokenMock) => {
            if (typeof item === 'string') {
                const userTokenMock = this._resourceExplorer.loadType<UserTokenMock>(`${item}.dialog`);
                if (userTokenMock) {
                    userTokenMocks.push(userTokenMock);
                } else {
                    userTokenMocks.push(this._resourceExplorer.loadType<UserTokenMock>(item));
                }
            } else {
                const kind = item['$kind'];
                userTokenMocks.push(this._resourceExplorer.buildType<UserTokenMock, UserTokenMock>(kind, item));
            }
        });
        return userTokenMocks;
    }
}
