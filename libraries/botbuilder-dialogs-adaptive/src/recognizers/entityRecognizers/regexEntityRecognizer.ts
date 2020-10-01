import { TextEntityRecognizer } from './textEntityRecognizer';
import { ModelResult } from 'botbuilder-dialogs';

/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Matches input against a regular expression.
 */
export class RegexEntityRecognizer extends TextEntityRecognizer {
    /**
     * Initializes a new instance of the `RegexEntityRecognizer` class.
     */
    public constructor();
    /**
     * Initializes a new instance of the `RegexEntityRecognizer` class.
     * @param name The name match result `typeName` value.
     * @param pattern The regular expression pattern value.
     */
    public constructor(name?: string, pattern?: string) {
        super();
        if (name) { this.name = name; }
        if (pattern) { this.pattern = pattern; }
    }

    public name: string;

    /**
     * Gets the regular expression pattern value.
     */
    public get pattern(): string {
        return this._pattern;
    }

    /**
     * Sets the regular expression pattern value.
     */
    public set pattern(value: string) {
        if (value.startsWith('(?i)')) {
            value = value.substr(4);
        }
        this._pattern = value;
    }

    private _pattern: string;

    /**
     * @protected
     * Match recognizing implementation.
     * @param text Text to match.
     * @param culture Culture to use.
     * @returns The matched `ModelResult` list.
     */
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
