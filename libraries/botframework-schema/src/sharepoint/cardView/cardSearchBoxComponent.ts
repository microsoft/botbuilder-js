// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import type { BaseCardComponent } from './baseCardComponent';
import type { CardButtonBase } from './cardButtonBase';

/**
 * Search box button properties.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ICardSearchBoxButton extends CardButtonBase {
    // reserved for future. Not additional properties.
}

/**
 * Adaptive Card Extension Search box component. Represents a search box rendered in the card view.
 */
export interface CardSearchBoxComponent extends BaseCardComponent {
    /**
     * Unique component name.
     */
    componentName: 'searchBox';
    /**
     * Placeholder text to display.
     */
    placeholder?: string;
    /**
     * Default value to display.
     */
    defaultValue?: string;
    /**
     * Button displayed on the search box.
     */
    button: ICardSearchBoxButton;
}
