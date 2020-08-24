/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Converter } from './converter';

export class ConverterRegistration {
    public constructor(name: string, converter: Converter) {
        this.name = name;
        this.converter = converter;
    }

    public name: string;

    public converter: Converter;
}
