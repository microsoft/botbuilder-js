/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AdaptiveContext<O eepChangeList } from '../planningContext';
import { Configurable } from 'botbuilder-dialogs';
import { RecognizerResult } from 'botbuilder-core';

export interface InputSlotConfiguration {
    /**
     * (Optional) name of the slot.
     */
    name?: string;

    /**
     * (Optional) entity to recognize.
     */
    entityName?: string;

    /**
     * The slots default locale to use if not specified as part of the received activity. Defaults
     * to `en-us`.
     */
    defaultLocale?: string;
}

export interface RecognizedInput<T = any> {
    succeeded: boolean;
    score?: number;
    value?: T;
}

export class InputSlot<T = any> extends Configurable {

    constructor(name?: string, entityName?: string) {
        super();
        if (name) { this.name = name }
        if (entityName) { this.entityName = entityName }
    }

    /**
     * (Optional) name of the slot.
     */
    public name: string;

    /**
     * (Optional) entity to recognize.
     */
    public entityName?: string;

    /**
     * The slots default locale to use if not specified as part of the received activity. Defaults
     * to `en-us`.
     */
    public defaultLocale: string = 'en-us';

    public configure(config: InputSlotConfiguration): this {
        return super.configure(config);
    }

    //=============================================================================================
    // Input Recognition
    //=============================================================================================
    
    public async recognizeInput(planning: AdaptiveContext<O ecognized: RecognizerResult, turnCount: number): Promise<RecognizedInput> {
        let result: RecognizedInput<T> = { succeeded: false };
        if (this.entityName) {
            if (recognized.entities && recognized.entities.hasOwnProperty(this.entityName)) {
                result = await this.onRecognizeEntity(planning, recognized.entities[this.entityName]);
            }    
        } else if (turnCount > 0 && recognized.text) {
            const locale = planning.context.activity.locale || this.defaultLocale;
            result = await this.onRecognizeUtterance(planning, recognized.text, locale);
        }

        // Format recognized result
        if (result.succeeded) {
            result.value = await this.onFormatValue(planning, result.value);
        }

        return result;
        
    }

    protected async onRecognizeEntity(planning: AdaptiveContext<O etity: T|T[]): Promise<RecognizedInput<T>> {
        const value = Array.isArray(entity) ? (entity.length > 0 ? entity[0] : undefined) : entity;
        return { succeeded: true, value: value, score: 1.0 };
    }

    protected async onRecognizeUtterance(planning: AdaptiveContext<O eterance: string, locale: string): Promise<RecognizedInput<T>> {
        return { succeeded: false };
    }

    protected async onFormatValue(planning: AdaptiveContext<O elue: T): Promise<T> {
        return value;
    }

    //=============================================================================================
    // Validation
    //=============================================================================================

    public validateValue(planning: AdaptiveContext<O elue: T): Promise<boolean> {
        return this.onValidateValue(planning, value);
    }
    
    protected async onValidateValue(planning: AdaptiveContext<O elue: T): Promise<boolean> {
        return true;
    }

    protected getValidationOption<O>(planning: AdaptiveContext<O etion: O|undefined, optionProperty: string|undefined): O|undefined {
        if (optionProperty && optionProperty.length > 0) {
            const setting = planning.state.getValue(optionProperty);
            return setting !== undefined ? setting : option;
        } else {
            return option;
        }
    }
}
