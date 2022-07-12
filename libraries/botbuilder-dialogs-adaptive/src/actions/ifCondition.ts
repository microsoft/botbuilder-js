/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActionScope } from './actionScope';
import { BoolExpression, BoolExpressionConverter } from 'adaptive-expressions';
import { BoolProperty } from '../properties';
import { DialogListConverter } from '../converters';
import { StringUtils } from 'botbuilder';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogDependencies,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export interface IfConditionConfiguration extends DialogConfiguration {
    condition?: BoolProperty;
    actions?: string[] | Dialog[];
    elseActions?: string[] | Dialog[];
    disabled?: BoolProperty;
}

/**
 * Conditional branch.
 */
export class IfCondition<O extends object = {}>
    extends Dialog<O>
    implements DialogDependencies, IfConditionConfiguration {
    static $kind = 'Microsoft.IfCondition';

    constructor();

    /**
     * Initializes a new instance of the [IfCondition](xref:botbuilder-dialogs-adaptive.IfCondition) class.
     *
     * @param condition Optional. Conditional expression to evaluate.
     * @param elseActions Optional. The actions to run if [condition](#condition) returns false.
     */
    constructor(condition?: string, elseActions?: Dialog[]) {
        super();
        if (condition) {
            this.condition = new BoolExpression(condition);
        }
        if (elseActions) {
            this.elseActions = elseActions;
        }
    }

    /**
     * Conditional expression to evaluate.
     */
    condition: BoolExpression;

    /**
     * The actions to run if [condition](#condition) returns true.
     */
    actions: Dialog[] = [];

    /**
     * The actions to run if [condition](#condition) returns false.
     */
    elseActions: Dialog[] = [];

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof IfConditionConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'condition':
                return new BoolExpressionConverter();
            case 'actions':
            case 'elseActions':
                return DialogListConverter;
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * @protected
     * Gets the true scope.
     * @returns An [ActionScope](xref:botbuilder-dialogs-adaptive.ActionScope).
     */
    protected get trueScope(): ActionScope {
        if (!this._trueScope) {
            this._trueScope = new ActionScope(this.actions);
            this._trueScope.id = `True${this.id}`;
        }
        return this._trueScope;
    }

    /**
     * @protected
     * Gets the false scope.
     * @returns An [ActionScope](xref:botbuilder-dialogs-adaptive.ActionScope).
     */
    protected get falseScope(): ActionScope {
        if (!this._falseScope) {
            this._falseScope = new ActionScope(this.elseActions);
            this._falseScope.id = `False${this.id}`;
        }
        return this._falseScope;
    }

    private _trueScope: ActionScope;

    private _falseScope: ActionScope;

    /**
     * Gets the child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies so they can be added to the containers [Dialog](xref:botbuilder-dialogs.Dialog) set.
     *
     * @returns The child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies.
     */
    getDependencies(): Dialog[] {
        return [].concat(this.trueScope, this.falseScope);
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        const conditionResult = this.condition.getValue(dc.state);
        if (conditionResult) {
            return await dc.replaceDialog(this.trueScope.id);
        } else if (!conditionResult && this.falseScope.actions && this.falseScope.actions.length > 0) {
            return await dc.replaceDialog(this.falseScope.id);
        }
        return await dc.endDialog();
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        const label = this.condition ? this.condition.toString() : '';
        const idList = this.actions.map((action: Dialog): string => action.id);
        return `If[${label}|${StringUtils.ellipsis(idList.join(','), 50)}]`;
    }
}
