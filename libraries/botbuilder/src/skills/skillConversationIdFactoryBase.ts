/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ConversationReference } from 'botbuilder-core';

/**
 * Defines the methods of a factory that is used to create unique conversation IDs for skill conversations.
 */
export abstract class SkillConversationIdFactoryBase {   
    /**
     * Creates a conversation ID for a skill conversation based on the caller's ConversationReference.
     * @remarks
     * It should be possible to use the returned string on a request URL and it should not contain special characters.
     * @param conversationReference The skill's caller ConversationReference.
     * @returns A unique conversation ID used to communicate with the skill.
     */
    public abstract createSkillConversationId(conversationReference: ConversationReference): Promise<string>;

    /**
     * Gets the ConversationReference created using createSkillConversationId() for a skillConversationId.
     * @param skillConversationId >A skill conversationId created using createSkillConversationId().
     * @returns The caller's ConversationReference for a skillConversationId. null if not found.
     */
    public abstract getConversationReference(skillConversationId: string): Promise<ConversationReference>;

    /**
     * Deletes a ConversationReference.
     * @param skillConversationId A skill conversationId created using createSkillConversationId().
     */
    public abstract deleteConversationReference(skillConversationId: string): Promise<void>;
}
