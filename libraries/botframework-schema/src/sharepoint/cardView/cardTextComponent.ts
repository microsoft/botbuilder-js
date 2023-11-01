// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import type { BaseCardComponent } from './baseCardComponent';

/**
 * Adaptive Card Extension Text component. Represents a text block rendered in the card view.
 */
export interface CardTextComponent extends BaseCardComponent {
    /**
     * Unique component name.
     */
    componentName: 'text';
    /**
     * Text to display.
     */
    text: string;
}
