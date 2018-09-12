/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext } from './dialogContext';
import { DialogReason, DialogTurnResult } from './dialog';

export interface WaterfallStepInfo<O extends object> {
    // The index of the current waterfall step being executed.
    index: number;

    // Any options the waterfall dialog was called with.
    options: O;

    // The reason the waterfall step is being executed.
    reason: DialogReason;

    // Results returned by a dialog called in the previous waterfall step.
    result: any;

    // A dictionary of values which will be persisted across all waterfall steps.
    values: object;

    /**
     * Used to skip to the next waterfall step.
     * @param result (Optional) result to pass to the next step.
     */
    onNext: (result?: any) => Promise<DialogTurnResult>;

}

export class WaterfallStepContext<O extends object = {}> extends DialogContext {
    private _info: WaterfallStepInfo<O>;

    constructor(dc: DialogContext, info: WaterfallStepInfo<O>) {
        super(dc.dialogs, dc.context, { dialogStack: dc.stack });
        this._info = info;
    }

    public get index(): number {
        return this._info.index;
    }

    public get options(): O {
        return this._info.options;
    }

    public get reason(): DialogReason {
        return this._info.reason;
    }

    public get result(): any {
        return this._info.result;
    }

    public get values(): object {
        return this._info.values;
    }

    public async next(result?: any): Promise<DialogTurnResult> {
        return await this._info.onNext(result);
    }
}