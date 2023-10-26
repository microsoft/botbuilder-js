// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import type { BaseCardComponent } from './baseCardComponent';
import type { CardButtonBase } from './cardButtonBase';

/**
 * Adaptive Card Extension Card button component.
 */
export interface CardButtonComponent extends BaseCardComponent, CardButtonBase {
    /**
     * Unique component name.
     */
    componentName: 'cardButton';
    /**
     * Text displayed on the button.
     */
    title: string;
    /**
     * Controls the style of the button.
     */
    style?: 'default' | 'positive';
}
