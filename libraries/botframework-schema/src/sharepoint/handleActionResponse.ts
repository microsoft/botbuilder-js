// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CardViewResponse } from './cardViewResponse';
import { QuickViewResponse } from './quickViewResponse';


export type ViewResponseType = 'Card' | 'QuickView' | 'NoOp';

export interface BaseHandleActionResponse {
    type: ViewResponseType;
    renderArguments?: CardViewResponse | QuickViewResponse;
}

export interface CardViewHandleActionResponse extends BaseHandleActionResponse {
    type: 'Card';
    renderArguments: CardViewResponse;
}

export interface QuickViewHandleActionResponse extends BaseHandleActionResponse {
    type: 'QuickView';
    renderArguments: QuickViewResponse;
}

export interface NoOpHandleActionResponse extends BaseHandleActionResponse {
    type: 'NoOp';
    renderArguments?: undefined;
}

export type HandleActionResponse = CardViewHandleActionResponse | QuickViewHandleActionResponse | NoOpHandleActionResponse;