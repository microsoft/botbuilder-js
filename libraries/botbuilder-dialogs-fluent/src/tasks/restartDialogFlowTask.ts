// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as assert from 'node:assert';
import { SuspendDialogFlowTask } from './suspendDialogFlowTask';
import { TaskResult } from './abstractDialogFlowTask';
import { DialogTurnResult, DialogContext } from 'botbuilder-dialogs';
import { TurnContext } from 'botbuilder-core';


/**
 * Represents a task that restarts the dialog flow.
 */
export class RestartDialogFlowTask extends SuspendDialogFlowTask<never, never> {

    /**
     * Initializes a new RestartWorkflowTask instance.
     * @param options (Optional) The options to pass to the restarted workflow.
     */
    constructor(
        private readonly options?: object
    ) {
        super(
            () => assert.fail("Unexpected call"),
            () => assert.fail("Unexpected call")
        );            
    }

    /**
     * @inheritdoc
     */
    override get kind(): string {
        return 'Restart';
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
    public override async onSuspend(
        dialogContext: DialogContext
    ): Promise<DialogTurnResult> {
        return dialogContext.replaceDialog(dialogContext.activeDialog!.id, this.options);
    }

    /**
     * @inheritdoc
     */
    public override onResume(
        turnContext: TurnContext, 
        result: any
    ): Promise<TaskResult<never>> {
        assert.fail("RestartWorkflowTask.onResume will never be called");
    }

    protected override clone(): this {
        assert.fail("RestartWorkflowTask.clone will never be called");
    }
}