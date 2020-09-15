/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { TestAdapter } from 'botbuilder-core';

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

    public convert(value: string | UserTokenMock): UserTokenMock {
        if (typeof (value) === 'string') {
            const userTokenMock = this._resourceExplorer.loadType(`${ value }.dialog`) as UserTokenMock;
            if (userTokenMock) {
                return userTokenMock;
            }
            return this._resourceExplorer.loadType(value) as UserTokenMock;
        } else {
            return this._resourceExplorer.buildType(value) as UserTokenMock;
        }
    }
}
