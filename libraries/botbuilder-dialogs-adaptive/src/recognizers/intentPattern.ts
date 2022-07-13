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

    /**
     * Initializes a new instance of the [IntentPattern](xref:botbuilder-dialogs-adaptive.IntentPattern) class.
     *
     * @param intent The intent.
     * @param pattern The regex pattern to match..
     */
    constructor(intent?: string, pattern?: string) {
        if (intent && pattern) {
            this.intent = intent;
            this.pattern = pattern;
        }
    }

    /**
     * @returns An instance of RegExp with the given pattern.
     */
    get regex(): RegExp {
        // eslint-disable-next-line security/detect-non-literal-regexp
        return new RegExp(this._pattern, 'ig');
    }

    /**
     * Gets the intent.
     *
     * @returns The intent.
     */
    get intent(): string {
        return this._intent;
    }

    /**
     * Sets the intent.
     */
    set intent(value: string) {
        this._intent = value[0] == '#' ? value.substr(1) : value;
    }

    /**
     * Gets the pattern.
     *
     * @returns The pattern.
     */
    get pattern(): string {
        return this._pattern;
    }

    /**
     * Sets the pattern
     */
    set pattern(value: string) {
        this._pattern = value.startsWith('(?i)') ? value.substr(4) : value;
    }
}
