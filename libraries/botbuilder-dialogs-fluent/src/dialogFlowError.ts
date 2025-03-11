// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export class DialogFlowError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DialogFlowError';
        Object.setPrototypeOf(this, DialogFlowError.prototype);
    }
}