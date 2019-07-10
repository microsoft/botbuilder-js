import { Diagnostic } from './diagnostic';

/**
 * Customized LG Exception
 */
export class LGException  extends Error {

    private Diagnostics: Diagnostic[];
    constructor(m: string, diagnostics: Diagnostic[]) {
        super(m);
        this.Diagnostics = diagnostics;
        Object.setPrototypeOf(this, LGException .prototype);
    }

    public getDiagnostic(): Diagnostic[] {
        return this.Diagnostics;
    }
}
