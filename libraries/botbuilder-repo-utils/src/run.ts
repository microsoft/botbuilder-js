// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type Success = {
    _type: 'success';
};

export function isSuccess(result: Result): result is Success {
    return result._type === 'success';
}

export function success(): Success {
    return { _type: 'success' };
}

export type Failure = {
    _type: 'failure';
    message: string;
    statusCode: number;
};

export function failure(message: string, statusCode = -1): Failure {
    return { _type: 'failure', message, statusCode };
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

                process.exit(result.statusCode);
            }

            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(-1);
        });
}
