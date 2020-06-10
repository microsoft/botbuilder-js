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

export class MultiLanguageRecognizerConverter implements Converter {
    private _recognizerConverter: RecognizerConverter;

    public constructor(resouceExplorer: ResourceExplorer) {
        this._recognizerConverter = new RecognizerConverter(resouceExplorer);
    }

    public convert(value: object): { [key: string]: Recognizer } {
        const recognizers = {};
        for (const key in value) {
            recognizers[key] = this._recognizerConverter.convert(value[key]);
        }
        return recognizers;
    }
}