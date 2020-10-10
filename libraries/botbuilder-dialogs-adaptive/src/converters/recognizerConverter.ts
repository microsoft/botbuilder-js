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

export class RecognizerConverter implements Converter<string, Recognizer> {
    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public convert(value: string | Recognizer): Recognizer {
        if (typeof value == 'string') {
            const recognizer = this._resourceExplorer.loadType<Recognizer>(`${value}.dialog`);
            return recognizer;
        }
        return value;
    }
}

export class RecognizerListConverter implements Converter<string[], Recognizer[]> {
    private _recognizerConverter: RecognizerConverter;

    public constructor(resourceExplorer: ResourceExplorer) {
        this._recognizerConverter = new RecognizerConverter(resourceExplorer);
    }

    public convert(value: string[] | Recognizer[]): Recognizer[] {
        const recognizers: Recognizer[] = [];
        value.forEach((item: string | Recognizer) => {
            recognizers.push(this._recognizerConverter.convert(item));
        });
        return recognizers;
    }
}
