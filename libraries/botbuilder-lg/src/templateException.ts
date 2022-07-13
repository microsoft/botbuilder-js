/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Diagnostic } from './diagnostic';

/**
 * LG Exception that contains diagnostics.
 */
export class TemplateException extends Error {
    private diagnostics: Diagnostic[];

    /**
     * Creates a new instance of the [TemplateException](xref:botbuilder-lg.TemplateException) class.
     *
     * @param m Error message.
     * @param diagnostics List of [Diagnostic](xref:botbuilder-lg.Diagnostic) to throw.
     */
    constructor(m: string, diagnostics: Diagnostic[]) {
        super(m);
        this.diagnostics = diagnostics;
        Object.setPrototypeOf(this, TemplateException.prototype);
    }

    /**
     * Diagnostics.
     *
     * @returns A diagnostic of the error or warning (range, message, severity, source, code).
     */
    getDiagnostic(): Diagnostic[] {
        return this.diagnostics;
    }
}
