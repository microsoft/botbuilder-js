// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SuspendDialogFlowTask } from './suspendDialogFlowTask';
import { defaultProjector } from './abstractDialogFlowTask';
import { DialogTurnResult, DialogContext, Dialog } from 'botbuilder-dialogs';
import { Activity } from 'botbuilder-core';


/**
 * Represents a task that prompts the user for input.
 */
export class ReceiveActivityTask extends SuspendDialogFlowTask<Activity> {

    /**
     * Initializes a new ReceiveActivityTask instance.
     */
    constructor() {
        super(defaultProjector, context => Promise.resolve<Activity>(context.activity));
    }

    /**
     * @inheritdoc
     */
    override get kind(): string {
        return 'ReceiveActivity';
    }

    /**
     * @inheritdoc
     */
    public override get id(): string {
        return '';
    }

    /**
     * @inheritdoc
     */
    public override onSuspend(
        dialogContext: DialogContext
    ): Promise<DialogTurnResult> {
        return Promise.resolve<DialogTurnResult>(Dialog.EndOfTurn);
    }
}
