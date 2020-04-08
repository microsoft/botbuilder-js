/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { UserState } from 'botbuilder-core';
import { BotStateMemoryScope } from './botStateMemoryScope';
import { ScopePath } from '../scopePath';

/**
 * Memory that's scoped to the current user.
 */
export class UserMemoryScope extends BotStateMemoryScope {
    constructor(userState: UserState, propertyName?: string) {
        super(ScopePath.user, userState, propertyName);
    }
}