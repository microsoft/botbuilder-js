// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * Options for analyzing LG templates.
 */
export class AnalyzerOptions {
    /**
     * Gets or sets a value determining if recursive calls throw an exception.
     *
     * @returns When true, throw an exception if a recursive call is detected.
     */
    ThrowOnRecursive?: boolean = null;

    private readonly _throwOnRecursive: string = '@throwOnRecursive';

    /**
     * Initializes a new instance of the [AnalyzerOptions](xref:botbuilder-lg.AnalyzerOptions) class.
     *
     * @param options Optional. Instance to copy analyzer settings from or list of strings containing the options from an LG file.
     */
    constructor(options?: AnalyzerOptions | string[]) {
        if (!options) {
            this.ThrowOnRecursive = null;
        } else if (options instanceof AnalyzerOptions) {
            this.ThrowOnRecursive = options.ThrowOnRecursive;
        } else {
            for (const option in options) {
                if (option && option.includes('=')) {
                    const index = option.indexOf('=');
                    const key = option.substring(0, index).trim();
                    const value = option.substring(index + 1).trim();
                    if (key === this._throwOnRecursive) {
                        if (value.toLowerCase() === 'true') {
                            this.ThrowOnRecursive = true;
                        }
                    }
                }
            }
        }
    }

    /**
     * Merge an incoming option to current option. If a property in incoming option is not null while it is null in current
     * option, then the value of this property will be overwritten.
     *
     * @param opt Incoming option for merging.
     * @returns Result after merging.
     */
    Merge(opt: AnalyzerOptions): AnalyzerOptions {
        const properties = Object.getOwnPropertyNames(opt);
        for (const property in properties) {
            if (this[property] && opt[property]) {
                this[property] = opt[property];
            }
        }

        return this;
    }
}
