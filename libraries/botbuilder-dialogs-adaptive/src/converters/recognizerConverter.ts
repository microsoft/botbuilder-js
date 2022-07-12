/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, Recognizer } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

/**
 * Recognizer converter that implements [Converter](xref:botbuilder-dialogs-declarative.Converter).
 */
export class RecognizerConverter implements Converter<string, Recognizer> {
    /**
     * Initializes a new instance of the [RecognizerConverter](xref:botbuilder-dialogs-adaptive.RecognizerConverter) class.
     *
     * @param _resourceExplorer Resource explorer to use for resolving references.
     */
    constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    /**
     * Converts an object or string to a [Recognizer](xref:botbuilder-dialogs-adaptive.Recognizer) instance.
     *
     * @param value An object or string value.
     * @returns A new [Recognizer](xref:botbuilder-dialogs-adaptive.Recognizer) instance.
     */
    convert(value: string | Recognizer): Recognizer {
        if (typeof value == 'string') {
            const recognizer = this._resourceExplorer.loadType<Recognizer>(`${value}.dialog`);
            return recognizer;
        }
        return value;
    }
}

/**
 * Recognizer list converter that implements [Converter](xref:botbuilder-dialogs-declarative.Converter).
 */
export class RecognizerListConverter implements Converter<string[], Recognizer[]> {
    private _recognizerConverter: RecognizerConverter;

    /**
     * Initializes a new instance of the [MultiLanguageRecognizerConverter](xref:botbuilder-dialogs-adaptive.MultiLanguageRecognizerConverter) class.
     *
     * @param resourceExplorer Resource explorer to use for resolving references.
     */
    constructor(resourceExplorer: ResourceExplorer) {
        this._recognizerConverter = new RecognizerConverter(resourceExplorer);
    }

    /**
     * @param value A list of recognizers as strings or recognizers.
     * @returns The list of recognizers
     */
    /**
     * @param value A list of string or a list of [Recognizer](xref:botbuilder-dialogs.Recognizer).
     * @returns A new list of [Recognizer](xref:botbuilder-dialogs.Recognizer) instances.
     */
    convert(value: string[] | Recognizer[]): Recognizer[] {
        const recognizers: Recognizer[] = [];
        value.forEach((item: string | Recognizer) => {
            recognizers.push(this._recognizerConverter.convert(item));
        });
        return recognizers;
    }
}
