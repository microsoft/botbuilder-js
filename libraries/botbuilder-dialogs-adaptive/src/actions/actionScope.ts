/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StringUtils } from 'botbuilder';
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogDependencies,
    DialogReason,
    DialogTurnResult,
} from 'botbuilder-dialogs';
import { ActionContext } from '../actionContext';
import { DialogListConverter } from '../converters';
import { TelemetryLoggerConstants } from '../telemetryLoggerConstants';

const OFFSET_KEY = 'this.offset';

export enum ActionScopeCommands {
    GotoAction = 'goto',
    BreakLoop = 'break',
    ContinueLoop = 'continue',
}

export interface ActionScopeResult {
    actionScopeCommand: string;
    actionId?: string;
}

export interface ActionScopeConfiguration extends DialogConfiguration {
    actions?: string[] | Dialog[];
}

/**
 * `ActionScope` manages execution of a block of actions, and supports Goto, Continue and Break semantics.
 */
export class ActionScope<O extends object = {}>
    extends Dialog<O>
    implements DialogDependencies, ActionScopeConfiguration {
    /**
     * Creates a new `ActionScope` instance.
     *
     * @param actions The actions for the scope.
     */
    constructor(actions: Dialog[] = []) {
        super();
        this.actions = actions;
    }

    /**
     * The actions to execute.
     */
    actions: Dialog[] = [];

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof ActionScopeConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'actions':
                return DialogListConverter;
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Gets a unique `string` which represents the version of this dialog. If the version
     * changes between turns the dialog system will emit a DialogChanged event.
     *
     * @returns Unique `string` which should only change when dialog has changed in a
     * way that should restart the dialog.
     */
    getVersion(): string {
        const versions = this.actions.map((action): string => action.getVersion() || '').join('');
        return StringUtils.hash(versions);
    }

    /**
     * Gets the child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies so they can be added to the containers [Dialog](xref:botbuilder-dialogs.Dialog) set.
     *
     * @returns The child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies.
     */
    getDependencies(): Dialog[] {
        return this.actions;
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is started and pushed onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        if (this.actions && this.actions.length > 0) {
            return await this.beginAction(dc, 0);
        } else {
            return await dc.endDialog();
        }
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is _continued_, where it is the active dialog and the
     * user replies with a new activity.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        return await this.onNextAction(dc);
    }

    /**
     * Called when a child [Dialog](xref:botbuilder-dialogs.Dialog) completed its turn, returning control to this dialog.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _reason [DialogReason](xref:botbuilder-dialogs.DialogReason), reason why the dialog resumed.
     * @param result Optional. Value returned from the dialog that was called. The type
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async resumeDialog(dc: DialogContext, _reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        if (result && typeof result === 'object' && Object.hasOwnProperty.call(result, 'actionScopeCommand')) {
            return await this.onActionScopeResult(dc, result as ActionScopeResult);
        }

        return await this.onNextAction(dc, result);
    }

    /**
     * @protected
     * Called when returning control to this [Dialog](xref:botbuilder-dialogs.Dialog) with an [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult)
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param actionScopeResult The [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult).
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onActionScopeResult(
        dc: DialogContext,
        actionScopeResult: ActionScopeResult
    ): Promise<DialogTurnResult> {
        switch (actionScopeResult.actionScopeCommand) {
            case ActionScopeCommands.GotoAction:
                return await this.onGotoAction(dc, actionScopeResult);
            case ActionScopeCommands.BreakLoop:
                return await this.onBreakLoop(dc, actionScopeResult);
            case ActionScopeCommands.ContinueLoop:
                return await this.onContinueLoop(dc, actionScopeResult);
            default:
                throw new Error(`Unknown action scope command returned: ${actionScopeResult.actionScopeCommand}.`);
        }
    }

    /**
     * @protected
     * Called when returning control to this [Dialog](xref:botbuilder-dialogs.Dialog) with an [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult)
     * with the property `ActionCommand` set to `GoToAction`.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param actionScopeResult The [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult).
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onGotoAction(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        const offset = this.actions.findIndex((action: Dialog): boolean => {
            return action.id == actionScopeResult.actionId;
        });
        if (offset >= 0) {
            return await this.beginAction(dc, offset);
        } else if (dc.stack.length > 1) {
            return await dc.endDialog(actionScopeResult);
        } else {
            throw new Error(`GotoAction: could not find an action of '${actionScopeResult.actionId}'`);
        }
    }

    /**
     * @protected
     * Called when returning control to this [Dialog](xref:botbuilder-dialogs.Dialog) with an [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult)
     * with the property `ActionCommand` set to `BreakLoop`.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param actionScopeResult Contains the actions scope result.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onBreakLoop(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await dc.endDialog(actionScopeResult);
    }

    /**
     * @protected
     * Called when returning control to this [Dialog](xref:botbuilder-dialogs.Dialog) with an [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult)
     * with the property `ActionCommand` set to `ContinueLoop`.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param actionScopeResult Contains the actions scope result.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onContinueLoop(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await dc.endDialog(actionScopeResult);
    }

    /**
     * @protected
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) continues to the next action.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param result Optional. Value returned from the dialog that was called. The type
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onNextAction(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        // Check for any plan changes
        let hasChanges = false;
        let root = dc;
        let parent = dc;
        while (parent) {
            const ac = parent as ActionContext;
            if (ac && ac.changes && ac.changes.length > 0) {
                hasChanges = true;
            }

            root = parent;
            parent = root.parent;
        }

        // Apply any changes
        if (hasChanges) {
            // Recursively call continueDialog() to apply changes and continue execution.
            return await root.continueDialog();
        }

        // Increment our offset into the actions and being the next action
        const nextOffset = dc.state.getValue(OFFSET_KEY, 0) + 1;
        if (nextOffset < this.actions.length) {
            return await this.beginAction(dc, nextOffset);
        }

        // else we fire the end of actions
        return await this.onEndOfActions(dc, result);
    }

    /**
     * @protected
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog)'s action ends.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param result Optional. Value returned from the dialog that was called. The type
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onEndOfActions(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        return await dc.endDialog(result);
    }

    /**
     * @protected
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param offset Optional, value returned from the dialog that was called. The type
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async beginAction(dc: DialogContext, offset: number): Promise<DialogTurnResult> {
        dc.state.setValue(OFFSET_KEY, offset);

        if (!this.actions || this.actions.length <= offset) {
            return await dc.endDialog();
        }

        const action = this.actions[offset];
        const actionName = action.constructor.name;

        const properties: { [key: string]: string } = {
            DialogId: action.id,
            Kind: `Microsoft.${actionName}`,
            ActionId: `Microsoft.${action.id}`,
        };
        this.telemetryClient.trackEvent({ name: TelemetryLoggerConstants.DialogActionEvent, properties: properties });

        return await dc.beginDialog(action.id);
    }

    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        const ids = this.actions.map((action: Dialog): string => action.id);
        return `ActionScope[${StringUtils.ellipsisHash(ids.join(','), 50)}]`;
    }
}
