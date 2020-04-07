/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Converter } from 'botbuilder-dialogs-declarative';

export class IntentPattern {
    private _intent: string;
    private _pattern: string;

    public constructor(intent?: string, pattern?: string) {
        if (intent && pattern) {
            this.intent = intent;
            this.pattern = pattern;
        }
    }

    public get regex(): RegExp {
        return new RegExp(this._pattern, 'ig');
    }

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
        this._pattern = value.startsWith('(?i)') ? value.substr(4) : value;
    }
}

export class IntentPatternConverter implements Converter {
    public convert(value: { intent: string; pattern: string }): IntentPattern {
        return new IntentPattern(value.intent, value.pattern);
    }
}
