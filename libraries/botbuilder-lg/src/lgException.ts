import { Diagnostic } from './diagnostic';

/**
 * Customized LG Exception
 */
export class LGException  extends Error {

    private diagnostics: Diagnostic[];
    constructor(m: string, diagnostics: Diagnostic[]) {
        super(m);
        this.diagnostics = diagnostics;
        Object.setPrototypeOf(this, LGException .prototype);
    }

    public getDiagnostic(): Diagnostic[] {
        return this.diagnostics;
    }
}
