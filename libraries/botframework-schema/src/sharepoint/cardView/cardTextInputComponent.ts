// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import type { CardImage } from './cardImage';
import type { BaseCardComponent } from './baseCardComponent';
import type { CardButtonBase } from './cardButtonBase';

/**
 * Text input icon button.
 */
export interface ICardTextInputIconButton extends CardButtonBase {
    /**
     * Properties for the icon displayed on the button.
     */
    icon: CardImage;
}

/**
 * Text input title button.
 */
export interface ICardTextInputTitleButton extends CardButtonBase {
    /**
     * Text displayed on the button.
     */
    title: string;
}

/**
 * Adaptive Card Extension Text input component.
 */
export interface CardTextInputComponent extends BaseCardComponent {
    /**
     * Unique component name.
     */
    componentName: 'textInput';
    /**
     * Placeholder text to display.
     */
    placeholder?: string;
    /**
     * Default value to display.
     */
    defaultValue?: string;
    /**
     * Properties for an optional icon, displayed in the left end of the text input.
     */
    iconBefore?: CardImage;
    /**
     * Properties for an optional icon, displayed in the right end of the text input.
     */
    iconAfter?: CardImage;
    /**
     * Optional button to display.
     */
    button?: ICardTextInputIconButton | ICardTextInputTitleButton;
    /**
     * Aria label for the text field.
     */
    ariaLabel?: string;
}
