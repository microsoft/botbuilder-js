// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Specialized error thrown when the dialog flow resumes after a task failure.
 *
 * @remarks
 * Because errors cannot be reliably reconstructed across suspend/result boundaries, their details
 * are captured in the execution history and made available to the dialog function as the message
 * property of the DialogFlowError object.
 */
export class DialogFlowError extends Error {
    /**
     * Initializes a new instance of the DialogFlowError class.
     *
     * @param message - The error message.
     */
    constructor(message: string) {
        super(message);
        this.name = 'DialogFlowError';
        Object.setPrototypeOf(this, DialogFlowError.prototype);
    }
}
