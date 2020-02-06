/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export class IntentPattern {
    private _intent: string;
    private _pattern: string;

    public constructor(intent?: string, pattern?: string) {
        if (intent && pattern) {
            this.intent = intent;
            this.pattern = pattern;
        }
    }

    public regex: RegExp;

    public get intent(): string {
        return this._intent;
    }

    public set intent(value: string) {
        this._intent = value[0] == '#' ? value.substr(1) : value;
    }

    public get pattern(): string {
        return this._pattern;
    }

    public set pattern(value: string) {
        this._pattern = value;
        this.regex = new RegExp(value, 'ig');
    }
}
