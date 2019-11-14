/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, InputHints, ActivityTypes } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import * as stringTemplate from './stringTemplate';

export class ActivityProperty {
    private _value: Partial<Activity>|string;
    private _textTemplate: (dc: DialogContext) => string;
    private _speak: string;
    private _speakTemplate: (dc: DialogContext) => string;

    public get displayLabel(): string {
        if (typeof this._value === 'object') {
            switch (this._value.type) {
                case ActivityTypes.Message:
                    return this._value.text;
                case ActivityTypes.Event:
                    return `event:${this._value.name}`;
                default:
                    return this._value.type;
            }
        } else {
            return this._value || '';
        }
    }

    public set value(value: Partial<Activity>|string) {
        this._value = value;
        this._textTemplate = undefined;
        if (typeof value === 'string') {
            this._textTemplate = stringTemplate.compile(value);
        } else if (typeof value === 'object' && value.type === ActivityTypes.Message) {
            this._textTemplate = stringTemplate.compile(value.text);
        }
    }

    public get value(): Partial<Activity>|string {
        return this._value;
    }

    public set speak(value: string) {
        this._speak = value;
        if (typeof value === 'string') {
            this._speakTemplate = stringTemplate.compile(value);
        } else {
            this._speakTemplate = undefined;
        }
    }

    public get speak(): string {
        return this._speak;
    }

    public inputHint: InputHints = InputHints.AcceptingInput;

    public hasValue(override?: Partial<Activity>|string): boolean {
        return !!(override || this._value);
    }

    public format(dc: DialogContext, extraData?: object, override?: Partial<Activity>|string): Partial<Activity> {
        // Format basic activity
        let activity: Partial<Activity>;
        if (override) {
            activity = this.formatOverride(override, dc);
        } else if (typeof this._value === 'string') {
            activity = {
                type: ActivityTypes.Message,
                text: this._textTemplate(dc)
            }
        } else if (typeof this._value === 'object') {
            if (this._value.type === ActivityTypes.Message && this._textTemplate) {
                activity = Object.assign({}, this._value, {
                    text: this._textTemplate(dc)
                });
            } else {
                activity = this._value;
            }
        } else {
            throw new Error(`ActivityProperty not assigned a value.`);
        }

        // Apply speak and inputHints
        if (activity.type === ActivityTypes.Message) {
            if (activity.speak) {
                activity.speak = stringTemplate.format(activity.speak, dc);
            } else if (this._speakTemplate) {
                activity.speak = this._speakTemplate(dc);
            }
            if (this.inputHint && !activity.inputHint) {
                activity.inputHint = this.inputHint;
            }
        }

        return activity;
    }

    private formatOverride(override: Partial<Activity>|string, dc: DialogContext): Partial<Activity> {
        if (typeof override === 'string') {
            return {
                type: ActivityTypes.Message,
                text: stringTemplate.format(override, dc)
            };
        } else if (override.type === ActivityTypes.Message && override.text) {
            return Object.assign({}, override, {
                text: stringTemplate.format(override.text, dc)
            });
        } else {
            return override;
        }
    }
}