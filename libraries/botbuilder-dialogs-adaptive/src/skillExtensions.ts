/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogManager } from 'botbuilder-dialogs';
import { BotFrameworkClient, SkillConversationIdFactoryBase } from 'botbuilder-core';

export const skillClientKey = Symbol('SkillClient');
export const skillConversationIdFactoryKey = Symbol('SkillConversationIdFactory');

export class SkillExtensions {
    /**
     * Configures the skill client to use.
     */
    public static useSkillClient(dialogManager: DialogManager, skillClient: BotFrameworkClient): DialogManager {
        dialogManager.initialTurnState.set(skillClientKey, skillClient);
        return dialogManager;
    }

    /**
     * Configures the skill conversation id factory to use.
     */
    public static useSkillConverationIdFactory(dialogManager: DialogManager, skillConversationIdFactory: SkillConversationIdFactoryBase): DialogManager {
        dialogManager.initialTurnState.set(skillConversationIdFactoryKey, skillConversationIdFactory);
        return dialogManager;
    }
}