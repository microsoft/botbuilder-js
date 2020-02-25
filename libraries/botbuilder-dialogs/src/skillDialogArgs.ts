/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, BotFrameworkSkill } from 'botbuilder-core';

/**
 * A class with dialog arguments for a SkillDialog.
 */
export interface SkillDialogArgs {
    /**
     * The BotFrameworkSkill that the dialog will call.
     */
    skill: BotFrameworkSkill;

    /**
     * The Activity to send to the skill.
     */
    activity: Activity;
}
