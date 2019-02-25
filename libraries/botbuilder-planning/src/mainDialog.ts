/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PlanningDialog } from './planningDialog';
import { Dialog } from 'botbuilder-dialogs';
import { FallbackRule } from './rules';

export class MainDialog extends PlanningDialog {
    public steps: Dialog[];

    constructor(steps?: Dialog[], dialogId = 'main') {
        super(dialogId);
        this.steps = steps;
    }

    protected onInstallDependencies(): void {
        // Add fallback rule and then install dependencies
        this.addRule(new FallbackRule(this.steps));
        super.onInstallDependencies();
    }
}