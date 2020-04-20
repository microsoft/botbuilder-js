
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

type nullSubstitutionType = (path: string) => object

export class EvaluationOptions {
    private static nullKeyReplaceStrRegex = /\${\s*path\s*}/;
    private readonly strictModeKey = '@stcict';
    private readonly replaceNullKey = '@replaceNull';
    private readonly lineBreakKey = '@lineBreakStyle';

    public strictMode: boolean | undefined;

    public nullSubstitution: nullSubstitutionType | undefined;

    public constructor(opt?: EvaluationOptions) {
        if (arguments.length === 0) {
            
        }
    }
}