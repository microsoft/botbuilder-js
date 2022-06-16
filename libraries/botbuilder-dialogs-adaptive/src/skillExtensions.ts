/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BotFrameworkClient, SkillConversationIdFactoryBase } from 'botbuilder';
import { DialogManager } from 'botbuilder-dialogs';

/**
 * The key to get or set skill client from turn state.
 */
export const skillClientKey = Symbol('SkillClient');

/**
 * The key to get or set skill conversation id factory from turn state.
 */
export const skillConversationIdFactoryKey = Symbol('SkillConversationIdFactory');

/**
 * Extension methods for skills.
 */
export class SkillExtensions {
    /**
     * Configures the skill client to use.
     *
     * @param dialogManager The dialog manager to add skill client to.
     * @param skillClient The skill client to be added.
     * @returns The existing dialog manager object with the new skill client state.
     */
    static useSkillClient(dialogManager: DialogManager, skillClient: BotFrameworkClient): DialogManager {
        dialogManager.initialTurnState.set(skillClientKey, skillClient);
        return dialogManager;
    }

    /**
     * Configures the skill conversation id factory to use.
     *
     * @param dialogManager The dialog manager to add skill conversation id factory to.
     * @param skillConversationIdFactory The skill conversation id factory to be added.
     * @returns The existing dialog manager object with the new skill conversation factory state.
     */
    static useSkillConversationIdFactory(
        dialogManager: DialogManager,
        skillConversationIdFactory: SkillConversationIdFactoryBase
    ): DialogManager {
        dialogManager.initialTurnState.set(skillConversationIdFactoryKey, skillConversationIdFactory);
        return dialogManager;
    }
}
