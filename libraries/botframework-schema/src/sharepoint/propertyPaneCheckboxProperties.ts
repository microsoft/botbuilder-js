// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';

/**
 * SharePoint property pane checkbox field properties.
 */
export interface PropertyPaneCheckboxProperties extends PropertyPaneFieldProperties {
    /**
     * The label text to display next to the checkbox.
     */
    text?: string;
    /**
     * Indicates whether the checkbox is disabled or not.
     */
    disabled?: boolean;
    /**
     * Indicates whether the checkbox is checked or not.
     */
    checked?: boolean;
}
