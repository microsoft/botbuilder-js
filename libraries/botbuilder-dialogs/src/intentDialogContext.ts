/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { RecognizerResult } from 'botbuilder-core';
import { DialogReason } from './dialog';
import { DialogContext } from './dialogContext';

/**
 * Values passed to the `WaterfallStepContext` constructor.
 */
export interface IntentDialogInfo<O extends object> {
    /**
     * Any options passed to the steps waterfall dialog when it was started with
     * `DialogContext.beginDialog()`.
     */
    options: O;

    /**
     * The reason the waterfall step is being executed.
     */
    reason: DialogReason;

    /**
     * Result returned by a dialog or prompt that was previously started using `beginDialog()`.
     */
    result: any;

    /**
     * 0 based index of the turn that's executing.
     */
    turn: number;

    /**
     * A dictionary of values which will be persisted for the lifetime of the intent dialog.
     */
    values: object;

    /**
     * (Optional) results returned by the recognizer that was run.
     */
    recognized?: RecognizerResult;
}

/**
 * Context object passed in to `IntentDialog.onRunTurn()`.
 * @param O (Optional) type of options passed in to the call to `IntentDialog.beginDialog()`.
 */
export class IntentDialogContext<O extends object = {}> extends DialogContext {
    private _info: IntentDialogInfo<O>;

    /**
     * Creates a new IntentDialogContext instance.
     * @param dc The dialog context for the current turn of conversation.
     * @param info Values to initialize the step context with.
     */
    constructor(dc: DialogContext, info: IntentDialogInfo<O>) {
        super(dc.dialogs, dc.context, { dialogStack: dc.stack });
        this._info = info;
    }

    /**
     * Any options passed to the steps waterfall dialog when it was started with
     * `DialogContext.beginDialog()`.
     */
    public get options(): O {
        return this._info.options;
    }

    /**
     * The reason the waterfall step is being executed.
     */
    public get reason(): DialogReason {
        return this._info.reason;
    }

    /**
     * (Optional) results returned by the recognizer that was run.
     */
    public get recognized(): RecognizerResult|undefined {
        return this._info.recognized;
    }

    /**
     * Results returned by a dialog or prompt that was called in the previous waterfall step.
     */
    public get result(): any {
        return this._info.result;
    }

    /**
     * 0 based index of the turn that's executing.
     */
    public get turn(): number {
        return this._info.turn;
    }

    /**
     * A dictionary of values which will be persisted for the lifetime of the intent dialog.
     */
    public get values(): object {
        return this._info.values;
    }
}
