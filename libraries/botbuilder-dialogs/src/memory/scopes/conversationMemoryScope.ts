/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotStateMemoryScope } from './botStateMemoryScope';
import { ConversationState } from 'botbuilder-core';
import { ScopePath } from './scopePath';

/**
 * Memory that's scoped to the current conversation.
 */
export class ConversationMemoryScope extends BotStateMemoryScope {
    constructor(conversationState: ConversationState, propertyName?: string) {
        super(ScopePath.CONVERSATION, conversationState, propertyName);
    }
}