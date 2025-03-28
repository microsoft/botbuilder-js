// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export * from './build';
export * from './install';

export const actions = {
    supported: ['connect'],
    valid(value: string) {
        return actions.supported.includes(value);
    },
};
