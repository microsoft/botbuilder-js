// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type Success = {
    _type: 'success';
    statusCode: number;
};

export function isSuccess(result: Result): result is Success {
    return result._type === 'success';
}

export function success(statusCode = 0): Success {
    return { _type: 'success', statusCode };
}

export type Failure = {
    _type: 'failure';
    statusCode: number;
    message?: string;
};

export function failure(statusCode = 1, message?: string): Failure {
    return { _type: 'failure', statusCode, message };
}

export function isFailure(result: Result): result is Failure {
    return result._type === 'failure';
}

export type Result = Success | Failure;

export async function run(logic: () => Promise<Result>): Promise<void> {
    return logic()
        .then((result) => {
            if (isFailure(result)) {
                if (result.message) {
                    console.error('[error]:', result.message);
                }
            }

            process.exit(result.statusCode);
        })
        .catch((err) => {
            console.error(err);
            process.exit(-1);
        });
}
