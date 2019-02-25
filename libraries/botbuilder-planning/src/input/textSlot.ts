/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PlanningContext } from '../planningContext';
import { InputSlot, RecognizedInput, InputSlotConfiguration, RecognizedInputType } from './inputSlot';
import { TextFormatTypes } from 'botbuilder-core';

export interface TextSlotConfiguration extends InputSlotConfiguration {
    minLength?: number;
    minLengthProperty?: string;
    pattern?: string|RegExp;
    patternProperty?: string;
    formatValue?: TextSlotFormat;
}

export enum TextSlotFormat {
    none = 'none',
    trim = 'trim',
    lowercase = 'lowercase',
    titlecase = 'titlecase',
    uppercase = 'uppercase'
}

export class TextSlot extends InputSlot<string> {

    public minLength?: number;
    public minLengthProperty?: string;

    public pattern?: RegExp;
    public patternProperty?: string;

    public formatValue: TextSlotFormat = TextSlotFormat.none;

    public configure(config: TextSlotConfiguration): this {
        // Patch pattern
        if (typeof config.pattern == 'string') {
            config.pattern = this.compilePattern(config.pattern);
        }

        return super.configure(config);
    }

    protected async onFormatValue(planning: PlanningContext, value: string): Promise<string> {
        if (this.formatValue !== TextSlotFormat.none) {
            value = value.trim();
            switch (this.formatValue) {
                case TextSlotFormat.lowercase:
                    value = value.toLocaleLowerCase();
                    break;
                case TextSlotFormat.uppercase:
                    value = value.toLocaleUpperCase();
                    break;
                case TextSlotFormat.titlecase:
                    value = value.replace(/\w\S*/g, (t) => t[0].toLocaleUpperCase() + t.substr(1).toLocaleLowerCase());
                    break;
            }
        }

        return value;
    }

    protected async onRecognizeUtterance(planning: PlanningContext, utterance: string, locale: string): Promise<RecognizedInput<string>|undefined> {
        if (utterance && utterance.length > 0) {
            return this.returnRecognizedInput(RecognizedInputType.set, utterance);
        }

        return undefined;
    }

    protected async onValidateValue(planning: PlanningContext, value: string): Promise<boolean> {
        // Check minimum length
        const minLength = this.getValidationOption(planning, this.minLength, this.minLengthProperty);
        if (typeof minLength == 'number' && minLength > 0 && value.length < minLength) {
            return false;
        }

        // Check pattern
        let pattern = this.getValidationOption(planning, this.pattern, this.patternProperty);
        if (typeof pattern == 'string') {
            pattern = this.compilePattern(pattern);
        }
        if (pattern && !pattern.test(value)) {
            return false;
        }

        return true;
    }

    private compilePattern(pattern: string): RegExp {
        const endPos = pattern.lastIndexOf('/');
        if (pattern[0] == '/' && endPos > 0) {
            // Pattern is in JavaScript format break out flags and expression
            const expression = pattern.substring(1, endPos);
            const flags = pattern.length > endPos ? pattern.substring(endPos + 1) : '';
            return new RegExp(expression, flags);
        } else {
            // Default to a case-insensitive pattern match
            return new RegExp(pattern, 'i');
        } 
    }
}
