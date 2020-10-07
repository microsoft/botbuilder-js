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
export class UserTokenMocksConverter implements Converter {
    private _resourceExplorer: ResourceExplorer;

    public constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;
    }

    public convert(value: string[] | UserTokenMock[]): UserTokenMock[] {
        const userTokenMocks: UserTokenMock[] = [];
        value.forEach((item: string | UserTokenMock) => {
            if (typeof item === 'string') {
                const userTokenMock = this._resourceExplorer.loadType(`${item}.dialog`) as UserTokenMock;
                if (userTokenMock) {
                    userTokenMocks.push(userTokenMock);
                } else {
                    userTokenMocks.push(this._resourceExplorer.loadType(item) as UserTokenMock);
                }
            } else {
                const kind = item['$kind'];
                userTokenMocks.push(this._resourceExplorer.buildType(kind, item) as UserTokenMock);
            }
        });
        return userTokenMocks;
    }
}
