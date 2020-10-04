/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TestAdapter } from 'botbuilder-core';
import { UserTokenMock } from './userTokenMock';

/**
 * Mock UserToken with user id and token.
 */
export class UserTokenBasicMock implements UserTokenMock {
    /**
     * Gets or sets the connection name.
     */
    public connectionName: string;

    /**
     * Gets or sets the channel ID.
     */
    public channelId: string;

    /**
     * Gets or sets the user ID.
     */
    public userId: string;

    /**
     * Gets or set the token to store.
     */
    public token: string;

    /**
     * Gets or set the optional magic code to associate with this token.
     */
    public magicCode: string;
    
    /**
     * Method to setup this mock for an adapter.
     * @param adapter The test adapter to use for mocking.
     */
    public setup(adapter: TestAdapter): void {
        const conversation = adapter.conversation;
        const channelId = this.channelId || conversation.channelId;
        const userId = this.userId || conversation.user.id;
        adapter.addUserToken(this.connectionName, channelId, userId, this.token, this.magicCode);
    }
}