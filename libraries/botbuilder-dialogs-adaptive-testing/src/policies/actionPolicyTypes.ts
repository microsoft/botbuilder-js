/**
 * @module botbuilderr-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Typess of action policies.
 */
export enum ActionPolicyType {
        // Last action in the list of actions. Nothing after this action will execute.
        LastAction = "LastAction",

        // Action is only a valid type for this trigger (can be in a list with others).
        AllowedTrigger = "AllowedTrigger",

        // Action is an 'interactive' type, and will expect input from the user on the next turn.
        Interactive = "Interactive",

        // The trigger does not allow interactive actions (no input dialogs).
        TriggerNotInteractive = "TriggerNotInteractive",

        // Action must be present for this trigger (can be in a list of options)
        TriggerRequiresAction = "TriggerRequiresAction",
};
