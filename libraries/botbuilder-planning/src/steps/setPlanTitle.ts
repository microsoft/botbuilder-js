/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand } from 'botbuilder-dialogs';
import { PlanningContext, PlanStepState, PlanChangeType } from '../planningContext';
import * as stringTemplate from '../stringTemplate';

export class SetPlanTitle extends DialogCommand {
    private _titleTemplate: (data: object) => string;

    public titleTemplate: string;

    /**
     * 
     * @param steps
     */
    constructor(titleTemplate?: string) {
        super();
        if (titleTemplate) { this.titleTemplate = titleTemplate }
    }

    protected onComputeID(): string {
        return `setPlanTitle(${this.titleTemplate})`;
    }

    protected async onRunCommand(planning: PlanningContext, options?: object): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(planning instanceof PlanningContext)) { throw new Error(`SetPlanTitle: should only be used within a planning or sequence dialog.`) }

        // Compile title on first use
        if (!this._titleTemplate) {
            this._titleTemplate = stringTemplate.compile(this.titleTemplate);
        }

        // Format plans new title
        const data = planning.state.toJSON();
        const title = this._titleTemplate(data);

        // Update plan title
        planning.updatePlanTitle(title);
        return await planning.endDialog();
    }
}