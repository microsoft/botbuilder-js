/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext, DialogState } from '../dialogContext';
import { DialogInstance, DialogTurnResult, Dialog, DialogTurnStatus } from '../dialog';
import { DialogSet } from '../dialogSet';
import { DialogCommand } from '../dialogCommand';

export class StepContext extends DialogContext {
    private readonly dc: DialogContext;
    private readonly stepState: DialogState;

    constructor(dc: DialogContext, dialogs: DialogSet, stepState: DialogState) {
        super(dialogs, dc.context, { dialogStack: [dc.activeDialog] }, dc.state.user, dc.state.conversation);
        this.dc = dc;
        this.stepState = stepState;

        // Append steps stack entries
        this.stepState.dialogStack.forEach((instance) => this.stack.push(instance));
    }

    public async continueDialog(): Promise<DialogTurnResult> {
        // Check to see if step has been started
        if (this.stack.length > 1) {
            // Continue step execution and update stepState
            const result = await super.continueDialog();
            this.updateStepState();
            return result;
        } else {
            // Mimic an empty dialog
            return { status: DialogTurnStatus.empty };
        }
    }

    public async beginDialog(dialogId: string, options?: object): Promise<DialogTurnResult> {
        // Begin dialog and update stepState
        const result = await super.beginDialog(dialogId, options);
        this.updateStepState();
        return result;
    }

    public async endDialog(result?: any): Promise<DialogTurnResult> {
        if (this.stack.length == 1) {
            // Parent is being ended
            this.stack.pop();
            return await this.dc.endDialog(result);
        } else if (this.stack.length == 2) {
            // Step is being ended
            const dialog = this.findDialog(this.activeDialog.id);
            this.stack.pop();

            // Manually resolve steps output binding
            if (dialog && dialog.outputBinding && result != undefined) {
                this.dc.state.setValue(dialog.outputBinding, result);
            } 

            // Return completion result
            return { 
                status: DialogTurnStatus.complete,
                result: result
            };
        } else {
            return await super.endDialog(result);
        }
    }

    public async replaceDialog(dialogId: string, options?: object): Promise<DialogTurnResult> {
        if (this.stack.length == 1) {
            // Parent is being replaced
            this.stack.pop();
            return await this.dc.replaceDialog(dialogId, options);
        } else {
            return await super.replaceDialog(dialogId, options);
        }
    }

    public async cancelAllDialogs(): Promise<DialogTurnResult> {
        // Remove fake root and then cancel
        this.stack.shift();
        return await super.cancelAllDialogs();
    }

    private updateStepState() {
        if (this.stack.length > 1) {
            this.stepState.dialogStack = this.stack.slice(1);
        } else {
            this.stepState.dialogStack = [];
        }
    }
}