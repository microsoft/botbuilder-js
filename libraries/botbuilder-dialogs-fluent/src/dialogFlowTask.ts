// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { 
    RetryPolicy, 
    RetrySettings 
} from './'

import { Jsonify } from 'type-fest'
import { ZodType, ZodTypeDef } from 'zod'
import { TurnContext } from 'botbuilder-core'

/**
 * Represents a task that can be executed in a dialog flow.
 * 
 * @template R The task's runtime execution result type
 * @template O The task's observable execution result type.
 */
export interface DialogFlowTask<R = any, O = Jsonify<R>> {

    /**
     * Gets the task's kind
     */
    get kind(): string;

    /**
     * Gets the persistent identifier for this task instance
     */
    get id(): string;

    /**
     * Configures the task's retry behavior on on failure
     * 
     * @param shouldRetry Whether to retry the task on failure
     * @returns The task instance.
     */
    configureRetry(shouldRetry: boolean) : this;

    /**
     * Configures the task's retry behavior on on failure
     * 
     * @param settings The settings used to configure the retry behavior.
     * @returns The task instance.
     */
    configureRetry(settings: RetrySettings) : this;

    /**
     * Configures the task's retry behavior on on failure
     * 
     * @param policy The retry policy used to configure the retry behavior.
     * @returns The task instance.
     */
    configureRetry(policy: RetryPolicy) : this;

    /**
     * Configures an asynchronous callback to run after the task is executed
     * 
     * @template T The type of result returned by the continuation callback
     * @param continuation The continuation callback
     * @returns A new task instance.
     */
    then<T>(
        continuation: (value: R, context: TurnContext) => T | Promise<T>
    ) : DialogFlowTask<T>;

    /**
     * Configures the task's deserialized execution result conversion to its observable value.
     * 
     * @template T The type of the observable value produced by the projector
     * @param projector The callback used to convert the deserialized result to its observable value
     * @returns A new task instance.
     * @remarks The projector will run every time the task replayed by the workflow.
     */
    project<T>(
        projector: (value: Jsonify<R>) => T
    ) : DialogFlowTask<R, T>;

    /**
     * Generator method used to yield the task's typed result.
     * @returns The generator used to yield the task's result.
     */
    result() : Generator<DialogFlowTask, O, O>;
}
