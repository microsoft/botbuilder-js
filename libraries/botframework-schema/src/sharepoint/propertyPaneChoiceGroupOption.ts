// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneChoiceGroupIconProperties } from './propertyPaneChoiceGroupIconProperties';
import { PropertyPaneChoiceGroupImageSize } from './propertyPaneChoiceGroupImageSize';

/**
 * SharePoint property pane choice group option.
 */
export interface PropertyPaneChoiceGroupOption {
    /**
     * Optional ariaLabel flag. Text for screen-reader to announce regardless of toggle state.
     */
    ariaLabel?: string;
    /**
     * Indicates whether the choice group option is disabled or not.
     */
    disabled?: boolean;
    /**
     * Indicates whether the choice group option is checked or not.
     */
    checked?: boolean;
    /**
     * The icon properties to use for the choice group option.
     */
    iconProps?: PropertyPaneChoiceGroupIconProperties;
    /**
     * The image size to use for the choice group option.
     */
    imageSize?: PropertyPaneChoiceGroupImageSize;
    /**
     * The image source to use for the choice group option.
     */
    imageSrc?: string;
    /**
     * The key to uniquely identify the choice group option.
     */
    key: string;
    /**
     * The text to display next for this choice group option.
     */
    text: string;
}
