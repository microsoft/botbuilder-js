/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext, DialogConfiguration } from 'botbuilder-dialogs';
import { ActionScopeResult, ActionScopeCommands } from './actionScope';

export interface GotoActionConfiguration extends DialogConfiguration {
    /**
     * ID of the action to goto.
     */
    actionId?: string;
}

export class GotoAction extends Dialog {

    /**
     * Creates a new `GotoAction` instance.
     * @param actionId ID of the action to goto.
     */
    constructor();
    constructor(actionId: string);
    constructor(actionId?: string) {
        super();
        if (actionId) { this.actionId = actionId }
    }

    protected onComputeId(): string {
        return `GotoAction[${this.actionId}]`;
    }

    public configure(config: GotoActionConfiguration): this {
        return super.configure(config);
    }

    /**
     * ID of the action to goto.
     */
    public actionId: string;

    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        const command: ActionScopeResult = {
            actionScopeCommand: ActionScopeCommands.goto,
            actionId: this.actionId
        }
        return dc.endDialog(command);
    }
}