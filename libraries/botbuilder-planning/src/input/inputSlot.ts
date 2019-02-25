/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PlanningContext, PlanChangeList } from '../planningContext';
import { Configurable } from 'botbuilder-dialogs';
import { RecognizerResult } from 'botbuilder-core';

export interface InputSlotConfiguration {
    /**
     * Name of the field.
     */
    name?: string;

    /**
     * If `true` then the field is required to have a value.
     */
    required?: boolean;

    /**
     * If `true` the field can be changed after its set.  Defaults to `false`.
     */
    canChange?: boolean;

    /**
     * (Optional) entity to recognize.
     */
    entityName?: string;
}

export interface RecognizedInput<T = any> {
    type: RecognizedInputType;
    value?: T;
    highConfidence?: boolean;
    changes?: PlanChangeList;
}

export enum RecognizedInputType {
    set = 'set',
    remove = 'remove',
    change = 'change',
    invalid = 'invalid',
    planChange = 'planChange'
}

export class InputSlot<T = any> extends Configurable {

    constructor();
    constructor(name: string, required: boolean);
    constructor(name: string, entityName: string, required: boolean);
    constructor(name?: string, entityNameOrRequired?: string|boolean, required?: boolean) {
        super();
        this.name = name;
        if (typeof entityNameOrRequired == 'string') {
            this.entityName = entityNameOrRequired;
            this.required = required;
        } else {
            this.required = required;
        }
        this.defaultLocale = 'en-us';
    }

    /**
     * Name of the field.
     */
    public name: string;

    /**
     * If `true` then the field is required to have a value. Defaults to `false`.
     */
    public required: boolean;

    /**
     * If `true` the field can be changed after its set.  Defaults to `false`.
     */
    public canChange: boolean;

    /**
     * (Optional) entity to recognize.
     */
    public entityName?: string;

    /**
     * The slots default locale to use if not specified as part of the received activity.
     */
    public defaultLocale: string;

    public configure(config: InputSlotConfiguration): this {
        return super.configure(config);
    }

    public async recognizeInput(planning: PlanningContext, recognized: RecognizerResult, turnCount: number, currentValue: T): Promise<RecognizedInput<T>|undefined> {
        // Validate current value
        if (currentValue !== undefined) {
            const isValid = await this.onValidateValue(planning, currentValue);
            if (!isValid) {
                return this.returnRecognizedInput(RecognizedInputType.invalid, currentValue, true);
            }
        }

        // Recognize input
        if (currentValue == undefined || this.canChange) {
            let result = await this.onRecognizeInput(planning, recognized, turnCount);
            if (result) {
                // Format value
                result.value = await this.onFormatValue(planning, result.value);

                // Validate new value
                if (result.type == RecognizedInputType.set || result.type == RecognizedInputType.change) {
                    const isValid = await this.onValidateValue(planning, result.value);
                    if (isValid) {
                        // Is this a change?
                        if (currentValue !== undefined) {
                            // Are they the same values?
                            result.type = RecognizedInputType.change;
                            if (this.onSameValues(currentValue, result.value)) {
                                // Ignore the change
                                return undefined;
                            }
                        }
                    } else {
                        // Return invalid value
                        result.type = RecognizedInputType.invalid;
                    }
                }

                return result;
            }
        }

        return undefined;
    }

    //=============================================================================================
    // Input Recognition
    //=============================================================================================
    
    protected async onRecognizeInput(planning: PlanningContext, recognized: RecognizerResult, turnCount: number): Promise<RecognizedInput<T>|undefined> {
        if (this.entityName) {
            if (recognized.entities && recognized.entities.hasOwnProperty(this.entityName)) {
                return await this.onRecognizeEntity(planning, recognized.entities[this.entityName]);
            }    
        } else if (turnCount > 0 && recognized.text) {
            const locale = planning.context.activity.locale || this.defaultLocale;
            return await this.onRecognizeUtterance(planning, recognized.text, locale);
        }

        return undefined;
    }

    protected async onRecognizeEntity(planning: PlanningContext, entity: T|T[]): Promise<RecognizedInput<T>|undefined> {
        const newValue = Array.isArray(entity) ? (entity.length > 0 ? entity[0] : undefined) : entity;
        return this.returnRecognizedInput(RecognizedInputType.set, newValue, true);
    }

    protected async onRecognizeUtterance(planning: PlanningContext, utterance: string, locale: string): Promise<RecognizedInput<T>|undefined> {
        return undefined;
    }

    protected async onFormatValue(planning: PlanningContext, value: T): Promise<T> {
        return value;
    }

    protected returnRecognizedInput(type: RecognizedInputType, value?: T, highConfidence = false): RecognizedInput<T> {
        return { type: type, value: value, highConfidence: highConfidence };
    }

    protected returnPlanChange(changes: PlanChangeList, highConfidence = false): RecognizedInput<T> {
        return { type: RecognizedInputType.planChange, changes: changes, highConfidence: highConfidence };
    }

    //=============================================================================================
    // Validation
    //=============================================================================================

    protected async onValidateValue(planning: PlanningContext, value: T): Promise<boolean> {
        return true;
    }

    protected onSameValues(currentValue: T, newValue: T): boolean {
        if (Array.isArray(currentValue) || typeof currentValue == 'object') {
            return JSON.stringify(currentValue) === JSON.stringify(newValue);
        } else {
            return currentValue === newValue;
        }
    }

    protected getValidationOption<O>(planning: PlanningContext, option: O|undefined, optionProperty: string|undefined): O|undefined {
        if (optionProperty && optionProperty.length > 0) {
            const setting = planning.state.getValue(optionProperty);
            return setting !== undefined ? setting : option;
        } else {
            return option;
        }
    }
}
