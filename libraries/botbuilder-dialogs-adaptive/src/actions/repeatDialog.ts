/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, TurnPath } from 'botbuilder-dialogs';
import { BaseInvokeDialog } from './baseInvokeDialog';
import { BoolExpression } from 'adaptive-expressions';

/**
 * Action which repeats the active dialog (restarting it).
 */
export class RepeatDialog<O extends object = {}> extends BaseInvokeDialog<O> {
    public constructor();

    /**
     * Initializes a new instance of the `RepeatDialog` class.
     * @param options Optional. Object with additional options.
     */
    public constructor(options?: O) {
        super(undefined, options);
    }

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;
    
    /**
     * An optional expression which if is true will allow loop of the repeated dialog.
     */
    public allowLoop?: BoolExpression;

    /**
     * Starts a new dialog and pushes it onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        const boundOptions = this.bindOptions(dc, options);
        const targetDialogId = dc.parent.activeDialog.id;

        const repeatedIds: string[] = dc.state.getValue(TurnPath.repeatedIds, []);
        if (repeatedIds.includes(targetDialogId)) {
            if (this.allowLoop == null || this.allowLoop.getValue(dc.state) == false) {
                throw new Error(`Recursive loop detected, ${ targetDialogId } cannot be repeated twice in one turn.`);
            }
        }
        else {
            repeatedIds.push(targetDialogId);
        }

        dc.state.setValue(TurnPath.repeatedIds, repeatedIds);
        
        // set the activity processed state (default is true)
        dc.state.setValue(TurnPath.activityProcessed, this.activityProcessed.getValue(dc.state));

        const turnResult = await dc.parent.replaceDialog(dc.parent.activeDialog.id, boundOptions);
        turnResult.parentEnded = true;
        return turnResult;
    }
}
