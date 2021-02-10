// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Represents successful execution
export type Success = {
    _type: 'success';
};

/**
 * Determine if a result is of the `Success` type
 *
 * @param {Result} result a result
 * @returns {boolean} true if the result is of the `Success` type
 */
export function isSuccess(result: Result): result is Success {
    return result._type === 'success';
}

/**
 * Builds a `Success` result
 *
 * @returns {Success} a `Success` result
 */
export function success(): Success {
    return { _type: 'success' };
}

// Represents failed execution
export type Failure = {
    _type: 'failure';
    message: string;
    statusCode: number;
};

/**
 * Builds a `Failure` result
 *
 * @param {string} message an error message
 * @param {number} statusCode a process exit code
 * @returns {Failure} a `Failure` result
 */
export function failure(message: string, statusCode = -1): Failure {
    return { _type: 'failure', message, statusCode };
}

/**
 * Determine if a result is of the `Failure` type
 *
 * @param {Result} result a result
 * @returns {boolean} true if the result is of the `Failure` type
 */
export function isFailure(result: Result): result is Failure {
    return result._type === 'failure';
}

// Result type is a union of Success and Failure
export type Result = Success | Failure;

/**
 * Executes `logic` and handles transforming the `Result` into proper process state. Logs errors and exits the process.
 *
 * @param {() => Promise<Result>} logic an operation to execute that yields a `Result`
 * @returns {Promise<void>} a promise representing execution of `logic`
 */
export async function run(logic: () => Promise<Result>): Promise<void> {
    try {
        const result = await logic();
        if (isFailure(result)) {
            if (result.message) {
                console.error('run', result.message);
            }

            process.exit(result.statusCode);
        }

        process.exit(0);
    } catch (err) {
        console.error('run', err);
        process.exit(-1);
    }
}
