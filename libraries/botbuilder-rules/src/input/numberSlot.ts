/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PlanningContext } from '../planningContext';
import { InputSlot, RecognizedInput, InputSlotConfiguration } from './inputSlot';
import * as Recognizers from '@microsoft/recognizers-text-number';

export interface NumberSlotConfiguration extends InputSlotConfiguration {
    minValue?: number;
    maxValue?: number;
    formatValue?: NumberSlotFormat;
}

export enum NumberSlotFormat {
    none = 'none',
    integer = 'integer'
}

export class NumberSlot extends InputSlot<number> {

    public minValue?: number;
    public minValueProperty?: string;
    
    public maxValue?: number;
    public maxValueProperty?: string;

    public formatValue: NumberSlotFormat = NumberSlotFormat.none;

    public configure(config: NumberSlotConfiguration): this {
        return super.configure(config);
    }

    protected async onRecognizeEntity(planning: PlanningContext, entity: number|number[]): Promise<RecognizedInput<number>|undefined> {
        const result = await super.onRecognizeEntity(planning, entity);
        if (result) {
            // Ensure result is a number
            if (typeof result.value == 'string') {
                try {
                    result.value = parseFloat(result.value);
                } catch (e) {
                    return undefined;
                }
            }
        }

        return result;
    }

    protected async onRecognizeUtterance(planning: PlanningContext, utterance: string, locale: string): Promise<RecognizedInput<number>|undefined> {
        if (utterance && utterance.length > 0) {
            const recognized: any = Recognizers.recognizeNumber(utterance, locale);
            if (recognized.length > 0 && recognized[0].resolution) {
                const value = parseFloat(recognized[0].resolution.value);
                return { succeeded: true, value: value, score: 1.0 };
            }
        }

        return { succeeded: false };
    }

    protected async onFormatValue(planning: PlanningContext, value: number): Promise<number> {
        if (this.formatValue == NumberSlotFormat.integer) {
            value = Math.floor(value);
        }

        return value;
    }

    protected async onValidateValue(planning: PlanningContext, value: number): Promise<boolean> {
        // Check minimum value
        const minValue = this.getValidationOption(planning, this.minValue, this.minValueProperty);
        if (typeof minValue == 'number' && value < minValue) {
            return false;
        }

        // Check maximum value
        const maxValue = this.getValidationOption(planning, this.maxValue, this.maxValueProperty);
        if (typeof maxValue == 'number' && value > maxValue) {
            return false;
        }

        return true;
    }
}
