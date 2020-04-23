
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export enum LGLineBreakStyle {
    Default = 'default',
    Markdown = 'markdown'
}

export class EvaluationOptions {
    private readonly nullKeyReplaceStrRegex = /\${\s*path\s*}/g;
    private readonly strictModeKey = '@strict';
    private readonly replaceNullKey = '@replaceNull';
    private readonly lineBreakKey = '@lineBreakStyle';

    public strictMode: boolean | undefined;

    public nullSubstitution: (path: string) => any | undefined;

    public LineBreakStyle: LGLineBreakStyle | undefined;

    public constructor(opt?: EvaluationOptions | string[]) {
        if (arguments.length === 0) {
            this.strictMode = undefined;
            this.nullSubstitution = undefined;
            this.LineBreakStyle = undefined;
        } else {
            if (opt instanceof EvaluationOptions) {
                this.strictMode = opt.strictMode;
                this.nullSubstitution = opt.nullSubstitution;
                this.LineBreakStyle = opt.LineBreakStyle;
            } else {
                if(opt !== undefined && opt.length > 0) {
                    for (const optionStr of opt) {
                        if(optionStr && optionStr.includes('=')) {
                            const index = optionStr.indexOf('=');
                            const key = optionStr.substring(0, index).trim();
                            const value = optionStr.substring(index + 1).trim();
                            if (key === this.strictModeKey) {
                                if (value.toLowerCase() === 'true') {
                                    this.strictMode = true;
                                }
                            } else if (key === this.replaceNullKey) {
                                this.nullSubstitution = (path): any => eval('`' + value.replace(this.nullKeyReplaceStrRegex, '${path}') + '`');
                            } else if (key === this.lineBreakKey) {
                                this.LineBreakStyle = value.toLowerCase() === LGLineBreakStyle.Markdown.toString().toLowerCase()? LGLineBreakStyle.Markdown : LGLineBreakStyle.Default;
                            }
                        }
                    } 
                }
            }
        }
    }

    public merge(opt: EvaluationOptions): EvaluationOptions {
        const properties = ['strictMode', 'nullSubstitution', 'LineBreakStyle'];
        for (const property of properties) {
            if (this[property] === undefined && opt[property] !== undefined) {
                this[property] = opt[property];
            }
        }

        return this;
    }
}