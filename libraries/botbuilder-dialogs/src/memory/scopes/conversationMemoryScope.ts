/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotStateMemoryScope } from './botStateMemoryScope';
import { ScopePath } from '../scopePath';

/**
 * Memory that's scoped to the current conversation.
 */
export class ConversationMemoryScope extends BotStateMemoryScope {
    protected stateKey = 'ConversationState';
    public constructor() {
        super(ScopePath.conversation);
    }
}
