/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { EventRule } from './eventRule';
import { RuleDialogEventNames } from '../planningContext';
import { Dialog } from 'botbuilder-dialogs';

/**
 * This rule is triggered when a message is received and isn't handled.
 * 
 * @remarks
 * A message is considered unhandled if there were no other rules triggered by the message and 
 * there is no active plan being executed.
 */
export class NoMatchRule extends EventRule {

    /**
     * Creates a new `DefaultResponseRule` instance.
     * @param steps (Optional) list of steps to update the plan with when triggered.
     */
    constructor(steps?: Dialog[]) {
        super(RuleDialogEventNames.unhandledUtterance, steps);
    }
}
