// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Callback invoked when handling execution errors
 * 
 * @param error The execution error 
 * @param attempt The current retry attempt
 * @returns A promise which indicates whether the error should be retried
 */
export type RetryPolicy = (error: any, attempt: number) => Promise<boolean>;

/**
 * The policy used to never retry 
 * 
 * @param error The execution error 
 * @param count The current retry count
 * @returns A promise which resolves to false always
 */
export const noRetry: RetryPolicy = (error, count) => Promise.resolve(false);


/**
 * Settings used to configure a retry policy
 */
export interface RetrySettings {
    /**
     * The maximum number of retry attempts
     */
    readonly maxAttempts: number;

    /**
     * The callback used to get the retry delay for the current attempt
     */
    readonly retryDelay: RetryDelay;

    /**
     * Optional callback used to decide if an error should be retried
     */
    readonly errorFilter?: ErrorFilter;
}


/**
 * Callback used to decide if an error should be retried
 * 
 * @param error The execution error 
 * @returns true if the error should be retried; otherwise false
 */
export type ErrorFilter = (error: any) => boolean;

/**
 * The default error filter which will accept all errors
 * 
 * @param error The execution error 
 * @returns always true
 */
export const retryAny: ErrorFilter = (error) => true;

/**
 * Delegate used to determine the delay before the next retry attempt.
 * 
 * @param attempt The retry attempt number
 * @returns The time to wait, in milliseconds, before the next retry
 */
export type RetryDelay = (attempt: number) => number;

/**
 * Retry delay callback which will cause the policy to retry immediately
 */
export const immediateRetry: RetryDelay = () => 0;

/**
 * Gets a retry delay callback which will cause the policy to retry at fixed intervals
 * 
 * @param retryDelay The delay, in milliseconds, between retry attempts
 * @returns The retry delay callback
 */
export function linearRetry(retryDelay: number): RetryDelay {
    return (attempt) => retryDelay;
}

/**
 * Gets a retry delay callback which will cause the policy to retry at exponentially increasing
 * intervals.
 * 
 * @param initialDelay The initial retry delay
 * @param maxDelay The maximum delay. Once this value is reached retries will become linear
 * @returns The retry delay callback
 */
export function exponentialRetry(
    initialDelay: number,
    maxDelay: number
): RetryDelay {

    const maxExponentiationAttempts = maxDelay > initialDelay ?
        Math.floor(Math.log2(maxDelay / initialDelay)) : 0;

    if (maxExponentiationAttempts < 1) {
        return linearRetry(maxDelay);
    }

    return (attempt) => {
        return attempt < maxExponentiationAttempts ?
        initialDelay * (2 ** attempt) : maxDelay;
    }
}

/**
 * Gets a retry policy which will retry up to a supplied maximum number of times
 * 
 * @param retryDelay The callback used to get the retry delay for the current attempt
 * @param maxAttempts The maximum number of retry attempts
 * @param filter The callback used to decide if an error should be retried
 * @returns 
 */
export function retryPolicy(settings: RetrySettings): RetryPolicy {

    var { maxAttempts, retryDelay, errorFilter } = settings;

    errorFilter ??= retryAny;

    return async (error, attempt) => {

        if ((attempt < maxAttempts) && errorFilter(error)) {
            await delay(retryDelay(attempt));
            return true;
        }

        return false;
    }
}



/**
 * Returns a promise that is scheduled to complete after the suppiled interval (in milliseconds)
 * 
 * @param interval The delay duration, in milliseconds.  
 * @returns The delay promise
 */
function delay(interval: number): Promise<void> {    
    return  interval > 0 ?
        new Promise(resolve => setTimeout(resolve, interval)) :
        Promise.resolve();
}

