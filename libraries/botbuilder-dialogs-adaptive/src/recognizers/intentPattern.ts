/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Represents pattern for an intent.
 */
export class IntentPattern {
    private _intent: string;
    private _pattern: string;

    /**
     * Initializes a new instance of the [IntentPattern](xref:botbuilder-dialogs-adaptive.IntentPattern) class.
     * @param intent Optional. The intent.
     * @param pattern Optional. The regex pattern to match.
     */
    public constructor(intent?: string, pattern?: string) {
        if (intent && pattern) {
            this.intent = intent;
            this.pattern = pattern;
        }
    }

    /**
     * Gets the `RegExp` instance.
     */
    public get regex(): RegExp {
        return new RegExp(this._pattern, 'ig');
    }

    /**
     * Gets the intent.
     */
    public get intent(): string {
        return this._intent;
    }

    /**
     * Sets the intent.
     */
    public set intent(value: string) {
        this._intent = value[0] == '#' ? value.substr(1) : value;
    }

    /**
     * Gets the regex pattern to match.
     */
    public get pattern(): string {
        return this._pattern;
    }

    /**
     * Sets the regex pattern to match.
     */
    public set pattern(value: string) {
        this._pattern = value.startsWith('(?i)') ? value.substr(4) : value;
    }
}
