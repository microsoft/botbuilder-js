// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import type { CardAction } from '../actions/cardAction';
import type { BaseCardComponent } from './baseCardComponent';

/**
 * Adaptive Card Extension Search footer component. Represents a container with an image (in the shape of a circle) and text.
 */
export interface CardSearchFooterComponent extends BaseCardComponent {
    /**
     * Unique component name.
     */
    componentName: 'searchFooter';
    /**
     * Title text to display.
     */
    title: string;
    /**
     * Url to the image to use, should be a square aspect ratio and big enough to fit in the image area.
     */
    imageUrl?: string;
    /**
     * The initials to display in the image area when there is no image.
     */
    imageInitials?: string;
    /**
     * Primary text to display. For example, name of the person for people search.
     */
    text: string;
    /**
     * Action to invoke when the footer is selected.
     */
    onSelection?: CardAction;
}
