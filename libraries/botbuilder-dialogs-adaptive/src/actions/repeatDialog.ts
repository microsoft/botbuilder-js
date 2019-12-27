/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext } from 'botbuilder-dialogs';
import { BaseInvokeDialog } from './baseInvokeDialog';

export class RepeatDialog<O extends object = {}> extends BaseInvokeDialog<O> {

    public static declarativeType = 'Microsoft.RepeatDialog';

    public constructor();
    public constructor(options?: O) {
        super();
        if (options) { this.options = options; }
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        const boundOptions = this.bindOptions(dc, options);
        const targetDialogId = dc.parent.activeDialog.id;

        const repeatedIds: string[] = dc.state.getValue('turn.repeatedIds', []);
        if (repeatedIds.includes(targetDialogId)) {
            throw new Error(`Recursive loop detected, ${ targetDialogId } cannot be repeated twice in one turn.`);
        }

        repeatedIds.push(targetDialogId);
        dc.state.setValue('turn.repeatedIds', repeatedIds);

        if (this.includeActivity) {
            dc.state.setValue('turn.activityProccessed', false);
        }

        const turnResult = await dc.parent.replaceDialog(dc.parent.activeDialog.id, boundOptions);
        turnResult.parentEnded = true;
        return turnResult;
    }
}