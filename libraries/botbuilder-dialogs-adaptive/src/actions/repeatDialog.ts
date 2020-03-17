/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, TurnPath } from 'botbuilder-dialogs';
import { BaseInvokeDialog } from './baseInvokeDialog';
import { ObjectExpression, BoolExpression } from '../expressionProperties';

export class RepeatDialog<O extends object = {}> extends BaseInvokeDialog<O> {
    public constructor();
    public constructor(options?: O) {
        super();
        if (options) { this.options = new ObjectExpression<object>(options); }
    }

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        const boundOptions = this.bindOptions(dc, options);
        const targetDialogId = dc.parent.activeDialog.id;

        const repeatedIds: string[] = dc.state.getValue(TurnPath.REPEATEDIDS, []);
        if (repeatedIds.includes(targetDialogId)) {
            throw new Error(`Recursive loop detected, ${ targetDialogId } cannot be repeated twice in one turn.`);
        }

        repeatedIds.push(targetDialogId);
        dc.state.setValue(TurnPath.REPEATEDIDS, repeatedIds);

        dc.state.setValue(TurnPath.ACTIVITYPROCESSED, this.activityProcessed.getValue(dc.state));

        const turnResult = await dc.parent.replaceDialog(dc.parent.activeDialog.id, boundOptions);
        turnResult.parentEnded = true;
        return turnResult;
    }
}