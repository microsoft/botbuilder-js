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
 * Action which calls another dialog.
 */
export class BaseInvokeDialog<O extends object = {}> extends Dialog<O> implements DialogDependencies {
    /**
     * Initializes a new instance of the `BaseInvokeDialog` class.
     * Expression for `dialogId` to call (allowing dynamic expression).
     * @param dialogIdToCall Optional, id of the dialog to call.
     * @param bindingOptions Optional, binding options for the dialog to call.
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
     * Called when the dialog is started and pushed onto the dialog stack.
     * @remarks Method not implemented.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional, initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult<any>> {
        throw new Error('Method not implemented.');
    }

    /**
     * Gets the child dialog dependencies so they can be added to the containers dialog set.
     * @returns The child dialog dependencies.
     */
    public getDependencies(): Dialog<{}>[] {
        if (this.dialog && this.dialog.value) {
            return [this.dialog.value];
        }
        return [];
    }

    /**
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `${ this.constructor.name }[${ this.dialog && this.dialog.toString() }]`;
    }

    /**
     * Resolve Dialog Expression as either `Dialog`, or `StringExpression` to get `dialogid`.
     * @param dc The `DialogContext` for the current turn of conversation.
     */
    protected resolveDialog(dc: DialogContext): Dialog {
        if (this.dialog && this.dialog.value) {
            return this.dialog.value;
        }

        const expression = this.dialog.toExpression();
        const { value: dialogId } = expression.tryEvaluate(dc.state);
        const dialog = dc.findDialog(dialogId);
        if (!dialog) {
            throw new Error(`${ this.dialog.toString() } not found.`);
        }

        return dialog;
    }

    /**
     * BindOptions - evaluate expressions in options.
     * @param dc The `DialogContext` for the current turn of conversation.
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
