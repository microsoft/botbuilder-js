/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { Recognizer } from 'botbuilder-dialogs';

export class RecognizerConverter implements Converter {
    private _resourceExplorer: ResourceExplorer;

    public constructor(resouceExplorer: ResourceExplorer) {
        this._resourceExplorer = resouceExplorer;
    }

    public convert(value: string | object): Recognizer {
        if (typeof value == 'string') {
            const recognizer = this._resourceExplorer.loadType(`${ value }.dialog`) as Recognizer;
            return recognizer;
        }
        return value as Recognizer;
    }
}