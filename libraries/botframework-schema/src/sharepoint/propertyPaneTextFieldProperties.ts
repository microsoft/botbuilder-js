// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';

/**
 * SharePoint property pane text field properties.
 */
export interface PropertyPaneTextFieldProperties extends PropertyPaneFieldProperties {
    /**
     * The label of the text field.
     */
    label?: string;
    /**
     * The value of the text field.
     */
    value?: string;
    /**
     * Optional ariaLabel flag. Text for screen-reader to announce regardless of toggle state.
     */
    ariaLabel?: string;
    /**
     * The description to display under the text field.
     */
    description?: string;
    /**
     * Whether the text field is disabled or not.
     */
    disabled?: boolean;
    /**
     * If set, this will be displayed as an error message underneath the text field..
     */
    errorMessage?: string;
    /**
     * Name used to log PropertyPaneTextField value changes for engagement tracking.
     */
    logName?: string;
    /**
     * The maximum length of the text field.
     */
    maxLength?: number;
    /**
     * Whether or not the text field is multiline.
     */
    multiline?: boolean;
    /**
     * The placeholder text to display in the text field.
     */
    placeholder?: string;
    /**
     * Whether or not the multiline text field is resizable.
     */
    resizable?: boolean;
    /**
     * Specifies the visible height of a text area(multiline text TextField), in lines.
     */
    rows?: number;
    /**
     * Whether or not the text field is underlined.
     */
    underlined?: boolean;
}
