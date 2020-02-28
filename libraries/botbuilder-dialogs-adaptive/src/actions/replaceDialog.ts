/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, TurnPath } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'adaptive-expressions';
import { BaseInvokeDialog, BaseInvokeDialogConfiguration } from './baseInvokeDialog';

export interface ReplaceDialogConfiguration extends BaseInvokeDialogConfiguration {
    disabled?: string;
}

export class ReplaceDialog<O extends object = {}> extends BaseInvokeDialog<O> {
    public static declarativeType = 'Microsoft.ReplaceDialog';

    /**
     * Creates a new `ReplaceWithDialog` instance.
     * @param dialogId ID of the dialog to goto.
     * @param options (Optional) static options to pass the dialog.
     */
    public constructor();
    public constructor(dialogIdToCall: string, options?: O);
    public constructor(dialogIdToCall?: string, options?: O) {
        super(dialogIdToCall, options);
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

    private _disabled?: Expression;

    public configure(config: ReplaceDialogConfiguration): this {
        return super.configure(config);
    }
    
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        const dialog = this.resolveDialog(dc);
        const boundOptions = this.bindOptions(dc, options);

        if (this.includeActivity) {
            dc.state.setValue(TurnPath.ACTIVITYPROCESSED, false);
        }

        return await dc.replaceDialog(dialog.id, boundOptions);
    }
}