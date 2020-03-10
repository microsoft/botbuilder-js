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
export class TemplateException  extends Error {

    private diagnostics: Diagnostic[];
    public constructor(m: string, diagnostics: Diagnostic[]) {
        super(m);
        this.diagnostics = diagnostics;
        Object.setPrototypeOf(this, TemplateException .prototype);
    }

    /**
     * Diagnostics.
     */
    public getDiagnostic(): Diagnostic[] {
        return this.diagnostics;
    }
}
