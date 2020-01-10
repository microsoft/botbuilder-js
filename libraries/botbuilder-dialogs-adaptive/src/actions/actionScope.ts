/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogDependencies, DialogContext, DialogTurnResult, DialogReason, DialogConfiguration } from 'botbuilder-dialogs';

const OFFSET_KEY = 'this.offset';

export enum ActionScopeCommands {
    GotoAction = 'goto',
    BreakLoop = 'break',
    ContinueLoop = 'continue',
}

export interface ActionScopeResult {
    actionScopeCommand: string;
    actionId?: string;
}

export interface ActionScopeConfiguration extends DialogConfiguration {
    actions?: Dialog[];
}

export class ActionScope<O extends object = {}> extends Dialog<O> implements DialogDependencies {

    /**
     * Creates a new `ActionScope` instance.
     */
    public constructor(actions: Dialog[] = []) {
        super();
        this.actions = actions;
    }

    /**
     * The actions to execute.
     */
    public actions: Dialog[] = [];

    public getDependencies(): Dialog[] {
        return this.actions;
    }

    public configure(config: ActionScopeConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.actions && this.actions.length > 0) {
            return await this.beginAction(dc, 0);
        } else {
            return await dc.endDialog();
        }
    }

    public async resumeDialog(dc: DialogContext, _reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        if (result && typeof result === 'object' && result.hasOwnProperty('actionScopeCommand')) {
            return await this.onActionScopeResult(dc, result as ActionScopeResult);
        }

        const nextOffset = dc.state.getValue(OFFSET_KEY, 0) + 1;
        if (nextOffset < this.actions.length) {
            return await this.beginAction(dc, nextOffset);
        }

        return await this.onEndOfActions(dc, result);
    }

    protected async onActionScopeResult(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        switch (actionScopeResult.actionScopeCommand) {
            case ActionScopeCommands.GotoAction:
                return await this.onGotoAction(dc, actionScopeResult);
            case ActionScopeCommands.BreakLoop:
                return await this.onBreakLoop(dc, actionScopeResult);
            case ActionScopeCommands.ContinueLoop:
                return await this.onContinueLoop(dc, actionScopeResult);
            default:
                throw new Error(`Unknown action scope command returned: ${ actionScopeResult.actionScopeCommand }.`);
        }
    }

    protected async onGotoAction(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        const offset = this.actions.findIndex((action: Dialog): boolean => {
            return action.id == actionScopeResult.actionId;
        });
        if (offset >= 0) {
            return await this.beginAction(dc, offset);
        } else if (dc.stack.length > 1) {
            return await dc.endDialog(actionScopeResult);
        } else {
            throw new Error(`GotoAction: could not find an action of '${ actionScopeResult.actionId }'`);
        }
    }

    protected async onBreakLoop(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await dc.endDialog(actionScopeResult);
    }

    protected async onContinueLoop(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await dc.endDialog(actionScopeResult);
    }

    protected async onEndOfActions(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        return await dc.endDialog(result);
    }

    protected async beginAction(dc: DialogContext, offset: number): Promise<DialogTurnResult> {
        dc.state.setValue(OFFSET_KEY, offset);
        const actionId = this.actions[offset].id;

        return await dc.beginDialog(actionId);
    }

    protected onComputeId(): string {
        const ids = this.actions.map((action: Dialog): string => action.id);
        return `ActionScope[${ ids.join(',') }]`;
    }
}
