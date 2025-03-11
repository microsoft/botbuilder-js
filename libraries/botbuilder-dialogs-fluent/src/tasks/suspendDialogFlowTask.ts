// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AbstractDialogFlowTask, defaultProjector, TaskResult} from './abstractDialogFlowTask';
import { DialogFlowTask } from '../dialogFlowTask';
import { Jsonify } from 'type-fest';
import { DialogTurnResult, DialogContext } from 'botbuilder-dialogs';
import { TurnContext } from 'botbuilder-core';

function resumeDefault<R>(context: TurnContext, result: any): Promise<R> {
    return Promise.resolve<R>(result);
}

/**
 * Abstract task that will cause the dialog flow to be suspend and resumed once its result becomes available.
 * @template R The task's execution result type
 * @template O The task's observable execution result type.
 */
export abstract class SuspendDialogFlowTask<R, O = Jsonify<R>> extends AbstractDialogFlowTask<R, O> {

    /**
     * Initializes a new SuspendDialogFlowTask instance.
     * @param projector The callback used to convert the deserialized result to its observable value
     * @param resume The callback used to retrieve the task result.
    */
    constructor(
        projector: (value: Jsonify<R>) => O,
        private readonly resume: (context: TurnContext, result: any) => Promise<R> = resumeDefault<R>
    ) {
        super(projector);
    }    


    /**
     * @inheritdoc
     */
    override then<T>(
        continuation: (value: R, context: TurnContext) => T | Promise<T>
    ): DialogFlowTask<T, Jsonify<T>> {

        return Object.assign(
            this.project(defaultProjector) as SuspendDialogFlowTask<R>, {
                resume: (context, result) => this.resume(context, result)
                    .then(prev => continuation(prev, context))
        });        
    }

    /**
     * Invoked before the workflow is suspended.
     * @param dialogContext The dialog context for the current turn of conversation with the user.
     * @returns A promise resolving to the dialog turn result.
     */
    public abstract onSuspend(
        dialogContext: DialogContext
    ): Promise<DialogTurnResult>;

    /**
     * Invoked when the workflow is being resumed.
     * @param turnContext The turn context for the current turn of conversation with the user.
     * @param result The result of the invoked task.
     * @returns A promise resolving to the invocation result.
     */
    public onResume(
        turnContext: TurnContext, 
        result: any
    ): Promise<TaskResult<R>> {
        return this.applyRetryPolicy(this.resume, turnContext, result);
    }

    /**
     * @inheritdoc
     */
    protected override clone(): this {
        return Object.assign(super.clone(), {
            resume: this.resume
        });
    }
}

