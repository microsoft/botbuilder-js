/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Choice } from 'botbuilder-dialogs';

export class ChoiceSet extends Array<Choice>
{
    public constructor(obj: any) {
        super();
        if (obj instanceof Array) {
            obj.forEach(o => {
                if (typeof o === 'string') {
                    this.push( {
                        value: o
                    } as Choice);
                }
                else if (typeof o === 'object') {
                    this.push(o as Choice);
                }
            });
        }
    }
}
