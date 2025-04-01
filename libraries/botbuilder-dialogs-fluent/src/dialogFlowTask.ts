// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RetryPolicy, RetrySettings } from './retryPolicy';
import { ZodType } from 'zod';
import { TurnContext } from 'botbuilder-core';
import type { Jsonify } from 'type-fest';

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
    configureRetry(shouldRetry: boolean): this;

    /**
     * Configures the task's retry behavior on on failure
     *
     * @param settings The settings used to configure the retry behavior.
     * @returns The task instance.
     */
    configureRetry(settings: RetrySettings): this;

    /**
     * Configures the task's retry behavior on on failure
     *
     * @param policy The retry policy used to configure the retry behavior.
     * @returns The task instance.
     */
    configureRetry(policy: RetryPolicy): this;

    /**
     * Configures an asynchronous callback to run after the task is executed
     *
     * @template T The type of result returned by the continuation callback
     * @param continuation The continuation callback
     * @returns A new task instance.
     *
     * @remarks
     * Use this method to chain additional processing and avoid storing intermediate results in the
     * flow's execution history.
     *
     * ```JavaScript
     * let message = yield context.receiveActivity().then(activity => activity.text);
     * ```
     */
    then<T>(continuation: (value: R, context: TurnContext) => T | Promise<T>): DialogFlowTask<T>;

    /**
     * Configures the task's deserialized execution result conversion to its observable value.
     *
     * @template T The type of the observable value produced by the projector
     * @param projector The callback used to convert the deserialized result to its observable value
     * @returns A new task instance.
     *
     * @remarks
     * The projector will run every time the task replayed by the workflow.
     * Use this method to translate the task's observable result to a different type.
     *
     * ```JavaScript
     * let timex = yield context.prompt(
     *    DATE_TIME_PROMPT,
     *    'On what date would you like to travel?'
     * ).project(results => new TimexProperty(result[0].timex));
     * ```
     */
    project<T>(projector: (value: Jsonify<R>) => T): DialogFlowTask<R, T>;

    /**
     * Configures the task's deserialized execution result conversion to its observable value.
     *
     * @template T The type of the observable value produced by the projector
     * @param schema The zod schema used to parse the result
     * @returns A new task instance.
     */
    project<T>(schema: ZodType<T>): DialogFlowTask<R, T>;

    /**
     * Generator method used to yield the task's typed result.
     *
     * @returns The generator used to yield the task's result.
     *
     * @remarks
     * This method is useful when using typescript to infer the task's result type.
     */
    result(): Generator<DialogFlowTask, O, O>;
}
