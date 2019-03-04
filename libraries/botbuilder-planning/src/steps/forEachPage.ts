/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration, ConfirmPrompt } from 'botbuilder-dialogs';
import { PlanningContext, PlanStepState, PlanChangeType, PlanChangeList } from '../planningContext';
import { SendList } from './sendList';
import { BoolInput } from '../input';
import { IfNotProperty } from './ifNotProperty';
import { EndDialog } from './endDialog';

export interface ForEachPageConfiguration extends DialogConfiguration {
}

export class ForEachPage extends DialogCommand {
    constructor();
    constructor(property: string, steps: Dialog[]);
    constructor(property: string, pageSize: number, steps: Dialog[]);
    constructor(property?: string, pageSizeOrSteps?: number|Dialog[], steps?: Dialog[]) {
        super();
        if (Array.isArray(pageSizeOrSteps)) {
            steps = pageSizeOrSteps;
            pageSizeOrSteps = undefined;
        }
        if (property) { this.property = property }
        if (pageSizeOrSteps) { this.pageSize = pageSizeOrSteps as number }
        if (steps) { this.steps = steps } 
    }

    protected onComputeID(): string {
        return `forEachPage[${this.bindingPath}]`;
    }

    public property: string;
    public pageSize: number = 10;
    public steps: Dialog[] = [];

    public configure(config: ForEachPageConfiguration): this {
        return super.configure(config);
    }

    public getDependencies(): Dialog[] {
        return this.steps;
    }

    protected async onRunCommand(planning: PlanningContext, options: ForEachPageOptions): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(planning instanceof PlanningContext)) { throw new Error(`ForEachPage: should only be used within a planning or sequence dialog.`) }

        // Get next page of items
        const offset = options && typeof options.offset == 'number' ? options.offset : 0;
        const page = this.getPage(planning, offset);

        // Update current plan
        if (page.length > 0) {
            planning.state.setValue('dialog.page', page);
            const changes: PlanChangeList = {
                changeType: PlanChangeType.doSteps,
                steps: []
            };
            this.steps.forEach((step) => changes.steps.push({ dialogStack: [], dialogId: step.id }));
            if (page.length == this.pageSize) {
                // Add a call back into forEachPage() at the end of repeated steps.
                // - A new offset is passed in which causes the next page of results to be returned.
                changes.steps.push({ dialogStack: [], dialogId: this.id, options: { offset: offset + this.pageSize }});
            }
            planning.queueChanges(changes);
        }

        return await planning.endDialog();
    }

    private getPage(planning: PlanningContext, offset): any[] {
        const page: any[] = [];
        const end = offset + this.pageSize;
        const value = planning.state.getValue(this.property);
        if (Array.isArray(value)) {
            for (let i = offset; i >= offset && i < end; i++) {
                page.push(value[i]);
            }
        } else if (typeof value === 'object') {
            let i = 0;
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    if (i >= offset && i < end) {
                        page.push(value[key]);
                    }
                    i++;
                }
            }
        }
        return page;
    }
}

interface ForEachPageOptions {
    offset?: number;
}
