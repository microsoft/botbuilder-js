/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// import { StringExpression, BoolExpression } from 'adaptive-expressions';
import { BaseCancelAllDialogs } from './baseCancelAllDialogs';

export class CancelDialogs<O extends object = {}> extends BaseCancelAllDialogs<O> {
    public constructor();
    public constructor(eventName: string, eventValue?: string);
    public constructor(eventName?: string, eventValue?: string) {
        super(eventName, eventValue, false);
    }
}