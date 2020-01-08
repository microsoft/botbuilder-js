/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, TurnPath } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'botframework-expressions';
import { BaseInvokeDialog, BaseInvokeDialogConfiguration } from './baseInvokeDialog';

export interface RepeatDialogConfiguration extends BaseInvokeDialogConfiguration {
    disabled?: string;
}

export class RepeatDialog<O extends object = {}> extends BaseInvokeDialog<O> {
    public static declarativeType = 'Microsoft.RepeatDialog';

    public constructor();
    public constructor(options?: O) {
        super();
        if (options) { this.options = options; }
    }

    /**
     * Get an optional expression which if is true will disable this action.
     */
    public get disabled(): string {
        return this._disabled ? this._disabled.toString() : undefined;
    }

    /**
     * Set an optional expression which if is true will disable this action.
     */
    public set disabled(value: string) {
        this._disabled = value ? new ExpressionEngine().parse(value) : undefined;
    }

    private _disabled: Expression;

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        const boundOptions = this.bindOptions(dc, options);
        const targetDialogId = dc.parent.activeDialog.id;

        const repeatedIds: string[] = dc.state.getValue(TurnPath.REPEATEDIDS, []);
        if (repeatedIds.includes(targetDialogId)) {
            throw new Error(`Recursive loop detected, ${ targetDialogId } cannot be repeated twice in one turn.`);
        }

        repeatedIds.push(targetDialogId);
        dc.state.setValue(TurnPath.REPEATEDIDS, repeatedIds);

        if (this.includeActivity) {
            dc.state.setValue(TurnPath.ACTIVITYPROCESSED, false);
        }

        const turnResult = await dc.parent.replaceDialog(dc.parent.activeDialog.id, boundOptions);
        turnResult.parentEnded = true;
        return turnResult;
    }
}