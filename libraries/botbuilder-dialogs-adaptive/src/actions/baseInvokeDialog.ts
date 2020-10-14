/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogDependencies, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { ValueExpression, ObjectExpression, BoolExpression } from 'adaptive-expressions';
import { DialogExpression } from '../expressions';
import { replaceJsonRecursively } from '../jsonExtensions';

/**
 * Action which calls another [Dialog](xref:botbuilder-dialogs.Dialog).
 */
export class BaseInvokeDialog<O extends object = {}> extends Dialog<O> implements DialogDependencies {
    /**
     * Initializes a new instance of the [BaseInvokeDialog](xref:botbuilder-dialogs-adaptive.BaseInvokeDialog) class.
     * Expression for `dialogId` to call (allowing dynamic expression).
     * @param dialogIdToCall Optional. Id of the [Dialog](xref:botbuilder-dialogs.Dialog) to call.
     * @param bindingOptions Optional. Binding options for the dialog to call.
     */
    public constructor(dialogIdToCall?: string, bindingOptions?: O) {
        super();
        if (dialogIdToCall) {
            this.dialog = new DialogExpression(dialogIdToCall);
        }
        if (bindingOptions) {
            this.options = new ObjectExpression<object>(bindingOptions);
        }
    }

    /**
     * Configurable options for the dialog.
     */
    public options: ObjectExpression<object> = new ObjectExpression<object>();

    /**
     * The dialog to call.
     */
    public dialog: DialogExpression;

    /**
     * A value indicating whether to have the new dialog should process the activity.
     */
    public activityProcessed: BoolExpression = new BoolExpression(true);

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is started and pushed onto the dialog stack.
     * @remarks Method not implemented.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult<any>> {
        throw new Error('Method not implemented.');
    }

    /**
     * Gets the child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies so they can be added to the containers [Dialog](xref:botbuilder-dialogs.Dialog) set.
     * @returns The child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies.
     */
    public getDependencies(): Dialog<{}>[] {
        if (this.dialog && this.dialog.value) {
            return [this.dialog.value];
        }
        return [];
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `${this.constructor.name}[${this.dialog && this.dialog.toString()}]`;
    }

    /**
     * @protected
     * Resolve Dialog Expression as either [Dialog](xref:botbuilder-dialogs.Dialog), or [StringExpression](xref:adaptive-expressions.StringExpression) to get `dialogid`.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     */
    protected resolveDialog(dc: DialogContext): Dialog {
        if (this.dialog && this.dialog.value) {
            return this.dialog.value;
        }

        const expression = this.dialog.toExpression();
        const { value: dialogId } = expression.tryEvaluate(dc.state);
        const dialog = dc.findDialog(dialogId);
        if (!dialog) {
            throw new Error(`${this.dialog.toString()} not found.`);
        }

        return dialog;
    }

    /**
     * @protected
     * BindOptions - evaluate expressions in options.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Options to bind.
     * @returns The merged options with expressions bound to values.
     */
    protected bindOptions(dc: DialogContext, options: object): object {
        const bindingOptions = Object.assign({}, this.options.getValue(dc.state), options);
        const boundOptions = {};

        for (const key in bindingOptions) {
            const bindingValue = bindingOptions[key];
            let value = new ValueExpression(bindingValue).getValue(dc.state);

            if (value) {
                value = replaceJsonRecursively(dc.state, value);
            }

            boundOptions[key] = value;
        }

        return boundOptions;
    }
}
