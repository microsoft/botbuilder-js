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

export class RecognizerConverter implements Converter<any, Recognizer> {
    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public convert(value: string | object): Recognizer {
        if (typeof value == 'string') {
            const recognizer = this._resourceExplorer.loadType(`${value}.dialog`) as Recognizer;
            return recognizer;
        }
        return value as Recognizer;
    }
}

export class RecognizerListConverter implements Converter<any[], Recognizer[]> {
    private _recognizerConverter: RecognizerConverter;

    public constructor(resourceExplorer: ResourceExplorer) {
        this._recognizerConverter = new RecognizerConverter(resourceExplorer);
    }

    public convert(value: string[] | object[]): Recognizer[] {
        const recognizers: Recognizer[] = [];
        value.forEach((item: string | object) => {
            recognizers.push(this._recognizerConverter.convert(item));
        });
        return recognizers;
    }
}
