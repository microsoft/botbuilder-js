/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { Recognizer } from '../recognizers';

/**
 * Recognizer converter that implements [Converter](xref:botbuilder-dialogs-declarative.Converter).
 */
export class RecognizerConverter implements Converter {
    private _resourceExplorer: ResourceExplorer;

    /**
     * Initializes a new instance of the [RecognizerConverter](xref:botbuilder-dialogs-adaptive.RecognizerConverter) class.
     * @param resouceExplorer Resource explorer to use for resolving references.
     */
    public constructor(resouceExplorer: ResourceExplorer) {
        this._resourceExplorer = resouceExplorer;
    }

    /**
     * Converts an object or string to a [Recognizer](xref:botbuilder-dialogs-adaptive.Recognizer) instance.
     * @param value An object or string value.
     * @returns A new [Recognizer](xref:botbuilder-dialogs-adaptive.Recognizer) instance.
     */
    public convert(value: string | object): Recognizer {
        if (typeof value == 'string') {
            const recognizer = this._resourceExplorer.loadType(`${ value }.dialog`) as Recognizer;
            return recognizer;
        }
        return value as Recognizer;
    }
}
