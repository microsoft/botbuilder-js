/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, Recognizer } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { RecognizerConverter } from './recognizerConverter';

type Input = Record<string, string>;
type Output = Record<string, Recognizer>;

/**
 * Language generator converter that implements [Converter](xref:botbuilder-dialogs-declarative.Converter).
 */
export class MultiLanguageRecognizerConverter implements Converter<Input, Output> {
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
     * @param value An [Input](xref:botbuilder-dialogs-adaptive.Input) or [Output](xref:botbuilder-dialogs-adaptive.Output).
     * @returns A new [Output](xref:botbuilder-dialogs-adaptive.Output) instance.
     */
    convert(value: Input | Output): Output {
        return Object.entries(value).reduce((recognizers, [key, value]) => {
            return { ...recognizers, [key]: this._recognizerConverter.convert(value) };
        }, {});
    }
}
