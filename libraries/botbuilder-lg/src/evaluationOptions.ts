/* eslint-disable security/detect-object-injection */
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export enum LGLineBreakStyle {
    Default = 'default',
    Markdown = 'markdown',
}

/**
 * LG cache scope options.
 */
export enum LGCacheScope {
    /**
     * Global template cache scope.
     */
    Global = 'global',

    /**
     * Only cache result in the same layer of children in template.
     */
    Local = 'local',

    /**
     * Without cache.
     */
    None = 'none',
}

/**
 * Options for evaluating LG templates.
 */
export class EvaluationOptions {
    private readonly nullKeyReplaceStrRegex = /\${\s*path\s*}/g;
    private readonly strictModeKey = '@strict';
    private readonly replaceNullKey = '@replaceNull';
    private readonly lineBreakKey = '@lineBreakStyle';
    private readonly cacheScopeKey = '@cacheScope';

    strictMode: boolean | undefined;

    nullSubstitution: (path: string) => unknown;

    LineBreakStyle: LGLineBreakStyle | undefined;

    /**
     * The locale info for evaluating LG.
     */
    locale: string;

    /**
     * Cache scope of the evaluation result.
     */
    cacheScope: LGCacheScope | undefined;

    /**
     * Creates a new instance of the [EvaluationOptions](xref:botbuilder-lg.EvaluationOptions) class.
     *
     * @param opt Instance to copy initial settings from.
     */
    constructor(opt?: EvaluationOptions | string[]) {
        if (arguments.length === 0) {
            this.strictMode = undefined;
            this.nullSubstitution = undefined;
            this.LineBreakStyle = undefined;
            this.cacheScope = undefined;
        } else {
            if (opt instanceof EvaluationOptions) {
                this.strictMode = opt.strictMode;
                this.nullSubstitution = opt.nullSubstitution;
                this.LineBreakStyle = opt.LineBreakStyle;
                this.locale = opt.locale;
                this.cacheScope = opt.cacheScope;
            } else {
                if (opt !== undefined && opt.length > 0) {
                    for (const optionStr of opt) {
                        if (optionStr && optionStr.includes('=')) {
                            const index = optionStr.indexOf('=');
                            const key = optionStr.substring(0, index).trim();
                            const value = optionStr.substring(index + 1).trim();
                            if (key.toLowerCase() === this.strictModeKey.toLowerCase()) {
                                if (value.toLowerCase() === 'true') {
                                    this.strictMode = true;
                                }
                            } else if (key.toLowerCase() === this.replaceNullKey.toLowerCase()) {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                this.nullSubstitution = (path) =>
                                    // eslint-disable-next-line security/detect-eval-with-expression
                                    eval('`' + value.replace(this.nullKeyReplaceStrRegex, '${path}') + '`');
                            } else if (key.toLowerCase() === this.lineBreakKey.toLowerCase()) {
                                this.LineBreakStyle =
                                    value.toLowerCase() === LGLineBreakStyle.Markdown.toString().toLowerCase()
                                        ? LGLineBreakStyle.Markdown
                                        : LGLineBreakStyle.Default;
                            } else if (key.toLowerCase() === this.cacheScopeKey.toLowerCase()) {
                                for (const scope of Object.values(LGCacheScope)) {
                                    if (value.toLowerCase() === scope.toLowerCase()) {
                                        this.cacheScope = scope;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Merges an incoming option to current option. If a property in incoming option is not null while it is null in current
     * option, then the value of this property will be overwritten.
     *
     * @param opt Incoming option for merging.
     * @returns Result after merging.
     */
    merge(opt: EvaluationOptions): EvaluationOptions {
        const properties = ['strictMode', 'nullSubstitution', 'LineBreakStyle'];
        for (const property of properties) {
            if (this[property] === undefined && opt[property] !== undefined) {
                this[property] = opt[property];
            }
        }

        return this;
    }
}
