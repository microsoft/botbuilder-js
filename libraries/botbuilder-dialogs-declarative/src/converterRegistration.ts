/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Converter } from './converter';

/**
 * Registers a converter to receive notifications on converter events.
 */
export class ConverterRegistration {
    /**
     * Creates a new instance of the `ConverterRegistration` class.
     * @param name Name for the converter.
     * @param converter Converter.
     */
    public constructor(name: string, converter: Converter) {
        this.name = name;
        this.converter = converter;
    }

    public name: string;

    public converter: Converter;
}
