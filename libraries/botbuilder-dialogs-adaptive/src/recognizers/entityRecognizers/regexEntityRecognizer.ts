import { TextEntityRecognizer } from './textEntityRecognizer';
import { ModelResult } from 'botbuilder-dialogs';

/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export interface RegexEntityRecognizerConfiguration {
    name?: string;
    pattern?: string;
}

export class RegexEntityRecognizer extends TextEntityRecognizer {
    public static declarativeType = 'Microsoft.RegexEntityRecognizer';

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
        this._regex = new RegExp(value, 'ig');
    }

    public configure(config: RegexEntityRecognizerConfiguration): this {
        return super.configure(config);
    }

    private _pattern: string;

    private _regex: RegExp;

    protected recognize(text: string, culture: string): ModelResult[] {
        const results: ModelResult[] = [];

        for (const match of text.matchAll(this._regex)) {
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