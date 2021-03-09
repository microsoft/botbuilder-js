/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    BoolExpression,
    BoolExpressionConverter,
    EnumExpression,
    EnumExpressionConverter,
    Expression,
} from 'adaptive-expressions';
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
import { ActionContext } from '../actionContext';
import { ActionChangeType } from '../actionChangeType';
import { ActionState } from '../actionState';
import { ActionChangeList } from '../actionChangeList';
import { DialogListConverter } from '../converters';

export interface EditActionsConfiguration extends DialogConfiguration {
    actions?: string[] | Dialog[];
    changeType?: ActionChangeType | string | Expression | EnumExpression<ActionChangeType>;
    disabled?: boolean | string | BoolExpression;
}

/**
 * Class which allows you to edit the current actions. 
 */
export class EditActions<O extends object = {}>
    extends Dialog<O>
    implements DialogDependencies, EditActionsConfiguration {
    public static $kind = 'Microsoft.EditActions';

    public constructor();

    /**
     * Initializes a new instance of the [EditActions](xref:botbuilder-dialogs-adaptive.EditActions) class.
     * @param changeType [ActionChangeType](xref:botbuilder-dialogs-adaptive.ActionChangeType), type of change to apply to the active actions.
     * @param actions Optional. Child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies so they can be added to the containers dialogset.
     */

    public constructor(changeType: ActionChangeType, actions?: Dialog[]);

    /**
     * Initializes a new instance of the [EditActions](xref:botbuilder-dialogs-adaptive.EditActions) class.
     * @param changeType Optional. [ActionChangeType](xref:botbuilder-dialogs-adaptive.ActionChangeType), type of change to apply to the active actions.
     * @param actions Optional. Child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies so they can be added to the containers dialogset.
     */
    public constructor(changeType?: ActionChangeType, actions?: Dialog[]) {
        super();
        if (changeType) {
            this.changeType = new EnumExpression<ActionChangeType>(changeType);
        }
        if (actions) {
            this.actions = actions;
        }
    }

    /**
     * The actions to update the dialog with.
     */
    public actions: Dialog[] = [];

    /**
     * The type of change to make to the dialogs list of actions.
     */
    public changeType: EnumExpression<ActionChangeType>;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: keyof EditActionsConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'actions':
                return DialogListConverter;
            case 'changeType':
                return new EnumExpressionConverter<ActionChangeType>(ActionChangeType);
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Gets the child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies so they can be added to the containers [Dialog](xref:botbuilder-dialogs.Dialog) set.
     * @returns The child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies.
     */
    public getDependencies(): Dialog[] {
        return this.actions;
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (dc.parent instanceof ActionContext) {
            const planActions = this.actions.map(
                (action: Dialog): ActionState => {
                    return {
                        dialogStack: [],
                        dialogId: action.id,
                        options: options,
                    };
                }
            );

            const changes: ActionChangeList = {
                changeType: this.changeType.getValue(dc.state),
                actions: planActions,
            };

            dc.parent.queueChanges(changes);
            return await dc.endDialog();
        } else {
            throw new Error(`EditActions should only be used in the context of an adaptive dialog.`);
        }
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        const idList = this.actions.map((action: Dialog): string => action.id);
        return `EditActions[${this.changeType.toString()}|${StringUtils.ellipsis(idList.join(','), 50)}]`;
    }
}
