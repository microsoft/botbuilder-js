// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import type { CardImage } from './cardImage';
import type { BaseCardComponent } from './baseCardComponent';

/**
 * Adaptive Card Extension Card view title area (card bar) component
 */
export interface CardBarComponent extends BaseCardComponent {
    /**
     * Unique component name.
     */
    componentName: 'cardBar';
    /**
     * The icon to display.
     */
    icon?: CardImage;
    /**
     * The title to display.
     */
    title?: string;
}
