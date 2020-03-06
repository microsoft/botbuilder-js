/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ConversationReference } from 'botframework-schema';
import { SkillConversationIdFactoryOptions } from './skillConversationIdFactoryOptions';
import { SkillConversationReference } from './skillConversationReference';

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
    public createSkillConversationIdWithOptions(options: SkillConversationIdFactoryOptions): Promise<string> {
        throw new Error('Not Implemented');
    }


    /**
     * Creates a conversation ID for a skill conversation based on the caller's ConversationReference.
     * @deprecated Method is deprecated, please use createSkillConversationIdWithOptions() with SkillConversationIdFactoryOptions instead.
     * @remarks
     * It should be possible to use the returned string on a request URL and it should not contain special characters.
     * @param conversationReference The skill's caller ConversationReference.
     * @returns A unique conversation ID used to communicate with the skill.
     */
    public createSkillConversationId(conversationReference: ConversationReference): Promise<string> {
        throw new Error('Not Implemented');
    }

    /**
     * Gets the ConversationReference created using createSkillConversationId() for a skillConversationId.
     * @deprecated Method is deprecated, please use getSkillConversationReference() instead.
     * @param skillConversationId >A skill conversationId created using createSkillConversationId().
     * @returns The caller's ConversationReference for a skillConversationId. null if not found.
     */
    public getConversationReference(skillConversationId: string): Promise<ConversationReference> {
        throw new Error('Not Implemented');
    }

    /**
     * Gets the SkillConversationReference created using createSkillConversationId() for a skillConversationId.
     * @param skillConversationId Gets the SkillConversationReference used during CreateSkillConversationIdAsync for a skillConversationId.
     */
    public getSkillConversationReference(skillConversationId: string): Promise<SkillConversationReference> {
        throw new Error('Not Implemented');
    }

    /**
     * Deletes a ConversationReference.
     * @param skillConversationId A skill conversationId created using createSkillConversationId().
     */
    public abstract deleteConversationReference(skillConversationId: string): Promise<void>;
}
