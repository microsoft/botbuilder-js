/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogManager } from 'botbuilder-dialogs';
import { BotFrameworkClient, SkillConversationIdFactoryBase } from 'botbuilder-core';

declare module 'botbuilder-dialogs/lib/dialogManager' {
    export interface DialogManager {
        useSkillClient(skillClient: BotFrameworkClient): DialogManager;
        useSkillConverationIdFactory(skillConverationIdFactory: SkillConversationIdFactoryBase): DialogManager;
    }
}

export const skillClientKey = Symbol('SkillClient');

/**
 * Configures the skill client to use.
 */
DialogManager.prototype.useSkillClient = function(skillClient: BotFrameworkClient): DialogManager {
    const _self = this as DialogManager;
    _self.initialTurnState.set(skillClientKey, skillClient);
    return _self;
};

export const skillConversationIdFactoryKey = Symbol('SkillConversationIdFactory');

/**
 * Configures the skill conversation id factory to use.
 */
DialogManager.prototype.useSkillConverationIdFactory = function(skillConversationIdFactory: SkillConversationIdFactoryBase): DialogManager {
    const _self = this as DialogManager;
    _self.initialTurnState.set(skillConversationIdFactoryKey, skillConversationIdFactory);
    return _self;
};