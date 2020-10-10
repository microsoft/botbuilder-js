/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { Recognizer } from '../recognizers';
import { RecognizerConverter } from './recognizerConverter';

type Input = Record<string, unknown>;
type Output = Record<string, Recognizer>;

export class MultiLanguageRecognizerConverter implements Converter<Input, Output> {
    private _recognizerConverter: RecognizerConverter;

    public constructor(resouceExplorer: ResourceExplorer) {
        this._recognizerConverter = new RecognizerConverter(resouceExplorer);
    }

    public convert(value: Input): Output {
        const recognizers = {};
        for (const key in value) {
            recognizers[key] = this._recognizerConverter.convert(value[key]);
        }
        return recognizers;
    }
}
