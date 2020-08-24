/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogManager } from 'botbuilder-dialogs';
import { BotFrameworkClient, SkillConversationIdFactoryBase } from 'botbuilder-core';

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
     * @param dialogManager The dialog manager to add skill client to.
     * @param skillClient The skill client to be added.
     */
    public static useSkillClient(dialogManager: DialogManager, skillClient: BotFrameworkClient): DialogManager {
        dialogManager.initialTurnState.set(skillClientKey, skillClient);
        return dialogManager;
    }

    /**
     * Configures the skill conversation id factory to use.
     * @param dialogManager The dialog manager to add skill conversation id factory to.
     * @param skillConversationIdFactory The skill conversation id factory to be added.
     */
    public static useSkillConversationIdFactory(dialogManager: DialogManager, skillConversationIdFactory: SkillConversationIdFactoryBase): DialogManager {
        dialogManager.initialTurnState.set(skillConversationIdFactoryKey, skillConversationIdFactory);
        return dialogManager;
    }
}
