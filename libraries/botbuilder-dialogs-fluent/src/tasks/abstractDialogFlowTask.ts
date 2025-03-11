// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import util from 'util';

import { 
    Jsonify, 
    JsonValue 
} from 'type-fest';

import {
    DialogFlowTask,
    DialogFlowError,
    RetryPolicy, 
    RetrySettings, 
    noRetry, 
    exponentialRetry, 
    retryPolicy
} from '../.'

import { TurnContext } from 'botbuilder-core';

/**
 * Abstract task that can be executed in a fluent dialog flow.
 *
 * @template R The task's execution result type
 * @template O The task's observable execution result type.
 */
export abstract class AbstractDialogFlowTask<R, O = Jsonify<R>> implements DialogFlowTask<R, O> {

    /**
     * Initializes a new AbstractWorkflowTask instance.
     * @param projector The callback used to convert the deserialized result to its observable value
     * @param retryPolicy - The retry policy used to configure the retry behavior.
     */
    constructor(
        private readonly projector: (value: Jsonify<R>) => O,
        private readonly retryPolicy: RetryPolicy = noRetry
    ) {
    }

    /**
     * @inheritdoc
     */
    public abstract get kind(): string;

    /**
     * @inheritdoc
     */
    public abstract get id(): string;

    /**
     * Gets the default retry settings.
     * @returns The default retry settings.
     */
    protected get defaultRetrySettings(): RetrySettings {
        return {
            maxAttempts: 5, 
            retryDelay: exponentialRetry(50, 1000),
            errorFilter: (error) => !(error instanceof DialogFlowError)
        };
    }

    /**
     * Configures the task's retry behavior on on failure
     * 
     * @param {boolean | RetrySettings | RetryPolicy} retryConfig - The retry configuration.
     * @returns The task instance.
     */
    public configureRetry(retryConfig: boolean | RetrySettings | RetryPolicy): this {

        if (typeof retryConfig === 'boolean') {
            retryConfig = retryConfig ? retryPolicy(this.defaultRetrySettings): noRetry;
        }
        else if (typeof retryConfig === 'object') {
            retryConfig = retryPolicy(retryConfig);
        }

        return Object.assign(this.clone(), {
            retryPolicy: retryConfig
        }); 
    }

    /**
     * @inheritdoc
     */
    public abstract then<T>(
        continuation: (value: R, context: TurnContext) => T | Promise<T>
    ) : DialogFlowTask<T>;

    /**
     * @inheritdoc
     */
    public project<T>(
        projector: (value: Jsonify<R>) => T
    ) : DialogFlowTask<R, T> {
        return Object.assign(this.clone(), {
            projector: projector
        });
    }

    /**
     * @inheritdoc
     */
    public *result() : Generator<DialogFlowTask, O, O> {
        let result: O = yield this;
        return result;
    }

    /**
     * Replays the result of a previous task execution.
     * @param generator The generator to replay.
     * @param result The result of the previous task execution.
     * @returns The iterator used to continue the workflow.
     */
    public replay<WorkflowResultType>(
        generator: Generator<DialogFlowTask, WorkflowResultType>, 
        result: TaskResult<R>
    ) : IteratorResult<DialogFlowTask, WorkflowResultType> {

        return (result.success === true) ?
            generator.next(this.projector(result.value)) :
            generator.throw(new DialogFlowError(result.error));
    }
    
    /**
     * Creates a shallow copy of the task.
     * @returns The cloned task.
     */
    protected clone(): this {
        return Object.assign(Object.create(this.constructor.prototype), this);
    }

    /**
     * Called to determine whether to retry the task.
     * @param error The error that occurred during task execution
     * @param attempt The current retry attempt
     * @returns true if the task should be retried; otherwise false.
     */
    protected shouldRetry(error: any, attempt: number): Promise<boolean> {
        return this.retryPolicy(error, attempt);
    }

    /**
     * Applies the retry policy to a task.
     * @param task The task to apply the retry policy to.
     * @param args The arguments to pass to the task.
     * @returns The result of the task execution.
     */
    protected async applyRetryPolicy<T extends (...args: any[]) => Promise<R>>(
        task: T,
        ...args: Parameters<T>
    ) : Promise<TaskResult<R>> {
    
        for(var attempt: number = 1;;++attempt) {
            var result = await this.invokeTask(task, ...args);

            if ((result.success === true) || !await this.shouldRetry(result.error, attempt)) {
                return result;
            }
        }
    }

    /**
     * Helper method to invoke a task and return the result as a TaskResult.
     * @param task The task to apply the retry policy to.
     * @param args The arguments to pass to the task.
     * @returns The result of the task execution.
     */
    private invokeTask<T extends (...args: any[]) => Promise<R>>(
        task: T,
        ...args: Parameters<T>
    ) : Promise<TaskResult<R>> {

        return task(...args)
            .then(taskSucceeded)
            .catch(taskFailed);
    }
}


/**
 * Represents the outcome of a task's execution.
 * @template T (Optional) The task's runtime execution result type
 */
export type TaskResult<T = any> = {
  success: true, 
  value?: Jsonify<T>,
} | {
  success: false, 
  error: string
};

/**
 * Converts the task execution result to a TaskResult.
 * @template T The task's runtime execution result type.
 * @param value The task's execution result.
 * @returns The TaskResult.
 */
export function taskSucceeded<T>(value: T): TaskResult<T> {
  return {
    success: true,
    value: convertToJson(value)
  };
}

/**
 * Converts a task execution failure to a TaskResult.
 * @template T The task's runtime execution result type.
 * @param error The error that occurred during task execution.
 * @returns The TaskResult.
 */
export function taskFailed<T>(error: any): TaskResult<T> {
  return {
    success: false,
    error: util.inspect(error, {depth: null, showHidden: true})
  };
}

/**
 * Default value to json converter
 * @template T The type of value to convert.
 * @param value The value to convert.
 * @returns The converted value.
 */
export function convertToJson<T>(value: T): Jsonify<T> {
  return JSON.parse(JSON.stringify(value)) as Jsonify<T>;
}

/**
 * The default projector function used to convert the deserialized result to its observable value.
 * This function simply returns the passed-in value without any modifications.
 * 
 * @param value The value to convert.
 * @template T The type of the value to convert.
 * @returns The passed-in value.
 */
export function defaultProjector<T extends JsonValue>(value: T): T {
    return value;
}

