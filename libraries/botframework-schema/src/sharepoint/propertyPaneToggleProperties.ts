// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';

/**
 * SharePoint property pane toggle field properties.
 */
export interface PropertyPaneToggleProperties extends PropertyPaneFieldProperties {
    /**
     * Optional ariaLabel flag. Text for screen-reader to announce regardless of toggle state.
     */
    ariaLabel?: string;
    /**
     * A label for the toggle.
     */
    label?: string;
    /**
     * Indicates whether the toggle is disabled or not.
     */
    disabled?: boolean;
    /**
     * Indicates whether the toggle is checked or not.
     */
    checked?: boolean;
    /**
     * A key to uniquely identify the toggle.
     */
    key?: string;
    /**
     * Text to display when toggle is OFF.
     */
    offText?: string;
    /**
     * Text to display when toggle is ON.
     */
    onText?: string;
    /**
     * Optional onAriaLabel flag. Text for screen-reader to announce when toggle is ON.
     */
    onAriaLabel?: string;
    /**
     * Optional offAriaLabel flag. Text for screen-reader to announce when toggle is OFF.
     */
    offAriaLabel?: string;
}
