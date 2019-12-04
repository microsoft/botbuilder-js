/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotStateMemoryScope } from './botStateMemoryScope';
import { UserState } from 'botbuilder-core';
import { ScopePath } from './scopePath';

/**
 * Memory that's scoped to the current user.
 */
export class UserMemoryScope extends BotStateMemoryScope {
    constructor(userState: UserState, propertyName?: string) {
        super(ScopePath.USER, userState, propertyName);
    }
}