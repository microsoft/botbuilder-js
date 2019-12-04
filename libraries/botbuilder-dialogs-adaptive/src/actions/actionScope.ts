/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogTurnResult, DialogContext, DialogReason, DialogConfiguration } from 'botbuilder-dialogs';

/**
 * @private
 */
const OFFSET_KEY: string = 'this.offset';

export enum ActionScopeCommands {
    goto = 'goto',
    break = 'break',
    continue = 'continue'
}

export interface ActionScopeResult {
    actionScopeCommand: ActionScopeCommands;
    actionId?: string;
}

export interface ActionScopeConfiguration extends DialogConfiguration {
    /**
     * Ordered set of actions to be executed within the scope.
     */
    actions?: Dialog[];
} 

export class ActionScope<O extends object = {}> extends Dialog<O> {

    /**
     * Creates a new `ActionBlock` instance.
     */
    constructor(actions?: Dialog[]) {
        super();
        if (actions) { this.actions = actions }
    }

    public actions: Dialog[] = [];

    public getDependencies(): Dialog[] {
        return this.actions;
    }

    protected onComputeId(): string {
        const ids = this.actions.map(a => a.id);
        return `ActionBlock[${this.hashedLabel(ids.join(','))}]`;
    }

    public configure(config: ActionScopeConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.actions.length > 0) {
            return await this.beginAction(dc, 0);
        } else {
            return await dc.endDialog();
        }
    }

    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // Check for action block command
        const nextOffset = dc.state.getValue(OFFSET_KEY) + 1;
        if (typeof result === 'object' && result.hasOwnProperty('actionScopeCommand')) {
            switch ((result as ActionScopeResult).actionScopeCommand) {
                case ActionScopeCommands.goto:
                    return await this.gotoAction(dc, (result as ActionScopeResult).actionId);
                case ActionScopeCommands.continue:
                    return await this.onContinue(dc);
                case ActionScopeCommands.break:
                default:
                    return await this.onBreak(dc);
            }
        } else if (nextOffset < this.actions.length) {
            return await this.beginAction(dc, nextOffset);
        } else {
            return await this.onEndOfActions(dc, result);
        }
    }

    protected async onBreak(dc: DialogContext): Promise<DialogTurnResult> {
        throw new Error(`Break action not supported within the current scope.`);
    }

    protected async onContinue(dc: DialogContext): Promise<DialogTurnResult> {
        throw new Error(`Continue action not supported within the current scope.`);
    }

    protected async onEndOfActions(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        return await dc.endDialog(result);
    }

    protected async beginAction(dc: DialogContext, offset: number): Promise<DialogTurnResult> {
        // Update offset and get actionId
        dc.state.setValue(OFFSET_KEY, offset);
        const actionId = this.actions[offset].id;

        // Begin action
        return await dc.beginDialog(actionId);
    }

    protected async gotoAction(dc: DialogContext, actionId: string): Promise<DialogTurnResult> {
        // Look for action to goto
        let offset = -1;
        for (let i = 0; i < this.actions.length; i++) {
            if (this.actions[i].id == actionId) {
                offset = i;
                break;
            }
        }

        // Is this a label for us?
        if (offset >= 0) {
            // Goto action
            return await this.beginAction(dc, offset);
        } else if (dc.stack.length > 1) {
            return await dc.endDialog({ 
                actionScopeCommand: ActionScopeCommands.goto,
                actionId: actionId
            } as ActionScopeResult);
        } else {
            throw new Error(`GotoAction: could not find an action of '${actionId}'.`);
        }
    }
}