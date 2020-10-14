/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { Recognizer } from '../recognizers';
import { RecognizerConverter } from './recognizerConverter';

/**
 * Language generator converter that implements [Converter](xref:botbuilder-dialogs-declarative.Converter).
 */
export class MultiLanguageRecognizerConverter implements Converter {
    private _recognizerConverter: RecognizerConverter;

    /**
     * Initializes a new instance of the [MultiLanguageRecognizerConverter](xref:botbuilder-dialogs-adaptive.MultiLanguageRecognizerConverter) class.
     * @param resouceExplorer Resource explorer to use for resolving references.
     */
    public constructor(resouceExplorer: ResourceExplorer) {
        this._recognizerConverter = new RecognizerConverter(resouceExplorer);
    }

    /**
     * Converts a recognizers object to an object with [Recognizer](xref:botbuilder-dialogs-adaptive.Recognizer) instance for each key.
     * @param value A recognizers object.
     * @returns The value object with [Recognizer](xref:botbuilder-dialogs-adaptive.Recognizer) instance for each key.
     */
    public convert(value: object): { [key: string]: Recognizer } {
        const recognizers = {};
        for (const key in value) {
            recognizers[key] = this._recognizerConverter.convert(value[key]);
        }
        return recognizers;
    }
}
