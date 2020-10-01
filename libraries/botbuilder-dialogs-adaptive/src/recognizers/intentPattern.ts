/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Converter } from 'botbuilder-dialogs-declarative';

/**
 * Represents pattern for an intent.
 */
export class IntentPattern {
    private _intent: string;
    private _pattern: string;

    /**
     * Initializes a new instance of the `IntentPattern` class.
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

/**
 * Input pattern converter that implements `Converter`.
 */
export class IntentPatternConverter implements Converter {
    /**
     * Converts an object or string to an `IntentPattern` instance.
     * @param value An object composed by the `intent` and the `pattern` to match.
     * @returns A new `IntentPattern` instance.
     */
    public convert(value: { intent: string; pattern: string }): IntentPattern {
        return new IntentPattern(value.intent, value.pattern);
    }
}
