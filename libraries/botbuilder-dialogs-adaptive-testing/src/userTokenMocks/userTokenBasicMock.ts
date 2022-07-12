/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TestAdapter } from 'botbuilder-core';
import { UserTokenMock } from './userTokenMock';

export interface UserTokenBasicMockConfiguration {
    connectionName?: string;
    channelId?: string;
    userId?: string;
    token?: string;
    magicCode?: string;
}

/**
 * Mock UserToken with user id and token.
 */
export class UserTokenBasicMock extends UserTokenMock implements UserTokenBasicMockConfiguration {
    static $kind = 'Microsoft.Test.UserTokenBasicMock';

    /**
     * Gets or sets the connection name.
     */
    connectionName: string;

    /**
     * Gets or sets the channel ID.
     */
    channelId: string;

    /**
     * Gets or sets the user ID.
     */
    userId: string;

    /**
     * Gets or set the token to store.
     */
    token: string;

    /**
     * Gets or set the optional magic code to associate with this token.
     */
    magicCode: string;

    /**
     * Method to setup this mock for an adapter.
     *
     * @param adapter The test adapter to use for mocking.
     */
    setup(adapter: TestAdapter): void {
        const conversation = adapter.conversation;
        const channelId = this.channelId || conversation.channelId;
        const userId = this.userId || conversation.user.id;
        adapter.addUserToken(this.connectionName, channelId, userId, this.token, this.magicCode);
    }
}
