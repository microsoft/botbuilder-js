import { TextEntityRecognizer } from './textEntityRecognizer';
import { ModelResult } from 'botbuilder-dialogs';

/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class RegexEntityRecognizer extends TextEntityRecognizer {
    public constructor();
    public constructor(name?: string, pattern?: string) {
        super();
        if (name) { this.name = name; }
        if (pattern) { this.pattern = pattern; }
    }

    public name: string;

    public get pattern(): string {
        return this._pattern;
    }

    public set pattern(value: string) {
        if (value.startsWith('(?i)')) {
            value = value.substr(4);
        }
        this._pattern = value;
    }

    private _pattern: string;

    protected recognize(text: string, culture: string): ModelResult[] {
        const results: ModelResult[] = [];

        const matches = [];
        let matched: RegExpExecArray;
        const regexp = new RegExp(this._pattern, 'ig');
        while (matched = regexp.exec(text)) {
            matches.push(matched);
            if (regexp.lastIndex == text.length) {
                break; // to avoid infinite loop
            }
        }

        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const text = match[0];
            const result: ModelResult = {
                typeName: this.name,
                text: text,
                start: match.index,
                end: match.index + text.length,
                resolution: {}
            };
            results.push(result);
        }

        return results;
    }
}
