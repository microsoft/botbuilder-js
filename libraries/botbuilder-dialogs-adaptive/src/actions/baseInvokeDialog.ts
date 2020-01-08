/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogDependencies, DialogContext, DialogTurnResult, DialogConfiguration, Configurable } from 'botbuilder-dialogs';
import { ExpressionEngine } from 'botframework-expressions';

export interface BaseInvokeDialogConfiguration extends DialogConfiguration {
    options?: object;
    dialog?: Dialog;
    includeActivity?: boolean;
}

export class BaseInvokeDialog<O extends object = {}> extends Dialog<O> implements DialogDependencies, Configurable {
    /**
     * Expression for dialogId to call.
     */
    private dialogIdToCall: string;

    public constructor(dialogIdToCall?: string, bindingOptions?: O) {
        super();
        this.dialogIdToCall = dialogIdToCall;
        if (bindingOptions) {
            this.options = bindingOptions;
        }
    }

    /**
     * Configurable options for the dialog.
     */
    public options: object;

    /**
     * The dialog to call.
     */
    public dialog: Dialog;

    /**
     * If this flag is true, then the activity is flagged to be processed by the new dialog.
     */
    public includeActivity: boolean;

    public configure(config: BaseInvokeDialogConfiguration): this {
        return super.configure(config);
    }

    public beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult<any>> {
        throw new Error('Method not implemented.');
    }

    public getDependencies(): Dialog<{}>[] {
        if (this.dialog) {
            return [this.dialog];
        }
        return [];
    }

    protected onComputeId(): string {
        return `${ this.constructor.name }[${ this.dialog ? this.dialog.id : this.dialogIdToCall }]`;
    }

    protected resolveDialog(dc: DialogContext): Dialog {
        if (this.dialog) {
            return this.dialog;
        }

        if (!this.dialogIdToCall) {
            throw new Error(`A dialog is required to be called.`);
        }

        const dialog = dc.findDialog(this.dialogIdToCall);
        if (!dialog) {
            throw new Error(`${ this.dialogIdToCall } not found.`);
        }

        return dialog;
    }

    protected bindOptions(dc: DialogContext, options: any): any {
        const bindingOptions = Object.assign({}, this.options, options);
        const boundOptions = {};

        for (const key in bindingOptions) {
            const val = bindingOptions[key];
            const { value, error } = new ExpressionEngine().parse(val).tryEvaluate(dc.state);
            if (error) {
                throw new Error(error);
            }
            boundOptions[key] = value;
        }

        return boundOptions;
    }
}