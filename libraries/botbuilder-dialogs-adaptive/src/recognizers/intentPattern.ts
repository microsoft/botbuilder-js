/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export class IntentPattern {
    private _intent: string;

    public pattern: string;

    public get intent(): string {
        return this._intent;
    }

    public set intent(value: string) {
        this._intent = value[0] == '#' ? value.substr(1) : value;
    }
}
