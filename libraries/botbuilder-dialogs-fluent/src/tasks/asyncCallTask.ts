// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogFlowTask } from '../dialogFlowTask';
import { AbstractDialogFlowTask, TaskResult, defaultProjector } from './abstractDialogFlowTask'
import { TurnContext } from 'botbuilder-core'
import { Jsonify } from 'type-fest';

/**
 * Represents the invocation of an async function.
 *
 * @template R The task's execution result type
 * @template O The task's observable execution result type.
*/
export class AsyncCallTask<R, O = Jsonify<R>> extends AbstractDialogFlowTask<R, O> {

    /**
     * Initializes a new AbstractWorkflowTask instance.
     * @param task The async function to invoke.
     * @param projector The callback used to convert the deserialized result to its observable value
     */
    constructor(
        private readonly task: (context: TurnContext) => Promise<R>,
        projector: (value: Jsonify<R>) => O
    ) {
        super(projector);
    }

    /**
     * @inheritdoc
     */
    override get kind(): string {
        return 'AsyncCall';
    }

    /**
     * @inheritdoc
     */
    public override get id(): string {
        return this.task.toString();
    }

    /**
     * @inheritdoc
     */
    override then<T>(
        continuation: (value: R, context: TurnContext) => T | Promise<T>
    ): DialogFlowTask<T> {
        
        return Object.assign(
            this.project(defaultProjector) as AsyncCallTask<R>, {
                task: (context: TurnContext) => this.task(context).then(result => continuation(result, context))
            }
        );    
    }

    /**
     * Executes the task.
     * @param context The turn context for the current turn of conversation with the user.
     * @returns The result of the task execution.
     */
    public invoke(context: TurnContext): Promise<TaskResult<R>> {
        return this.applyRetryPolicy(this.task, context);
    }

    /**
     * @inheritdoc
     */
    protected override clone(): this {
        return Object.assign(super.clone(), {
            task: this.task
        });
    }
}
