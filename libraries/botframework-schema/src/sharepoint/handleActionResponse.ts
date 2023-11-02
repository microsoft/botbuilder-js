// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CardViewResponse } from './cardViewResponse';
import { QuickViewResponse } from './quickViewResponse';

/**
 * The type of the view in the handle action response.
 */
export type ViewResponseType = 'Card' | 'QuickView' | 'NoOp';

/**
 * The base handle action response.
 */
export interface BaseHandleActionResponse {
    /**
     * The type of the view in the handle action response.
     */
    responseType: ViewResponseType;
    /**
     * The render arguments.
     */
    renderArguments?: CardViewResponse | QuickViewResponse;
}

/**
 * The handle action response for card view.
 */
export interface CardViewHandleActionResponse extends BaseHandleActionResponse {
    /**
     * Card view.
     */
    responseType: 'Card';
    /**
     * Card view render arguments.
     */
    renderArguments: CardViewResponse;
}

/**
 * The handle action response for quick view.
 */
export interface QuickViewHandleActionResponse extends BaseHandleActionResponse {
    /**
     * Quick view.
     */
    responseType: 'QuickView';
    /**
     * Quick view render arguments.
     */
    renderArguments: QuickViewResponse;
}

/**
 * The handle action response for no op.
 */
export interface NoOpHandleActionResponse extends BaseHandleActionResponse {
    /**
     * No op.
     */
    responseType: 'NoOp';
    /**
     * No op doesn't have render arguments.
     */
    renderArguments?: undefined;
}

/**
 * The handle action response.
 */
export type HandleActionResponse =
    | CardViewHandleActionResponse
    | QuickViewHandleActionResponse
    | NoOpHandleActionResponse;
