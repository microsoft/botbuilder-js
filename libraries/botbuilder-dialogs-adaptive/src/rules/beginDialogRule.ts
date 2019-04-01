/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { EventRule } from './eventRule';
import { RuleDialogEventNames, PlanChangeType } from '../planningContext';
import { Dialog } from 'botbuilder-dialogs';

/**
 * This rule is triggered when a dialog is first started.
 */
export class BeginDialogRule extends EventRule {

    /**
     * Creates a new `BeginDialogRule` instance.
     * @param steps (Optional) list of steps to initialize the dialogs plan with.
     */
    constructor(steps?: Dialog[]) {
        super(RuleDialogEventNames.beginDialog, steps, PlanChangeType.newPlan);
    }
}
