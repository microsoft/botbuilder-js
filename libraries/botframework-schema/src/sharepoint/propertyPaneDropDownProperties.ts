// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';
import { PropertyPaneDropDownOption } from './propertyPaneDropDownOption';

/**
 * SharePoint property pane dropdown field properties.
 */
export interface PropertyPaneDropDownProperties extends PropertyPaneFieldProperties {
    /**
     * Optional ariaLabel flag. Text for screen-reader to announce regardless of toggle state.
     */
    ariaLabel?: string;
    /**
     * The elemement's number or position in the current set of controls. Maps to native aria-positionset attribute. It starts from 1.
     */
    ariaPositionInSet?: number;
    /**
     * The total number of elements in the current set of controls. Maps to native aria-setsize attribute.
     */
    ariaSetSize?: number;
    /**
     * The label text to display next to the dropdown.
     */
    label: string;
    /**
     * Indicates whether the dropdown is disabled or not.
     */
    disabled?: boolean;
    /**
     * The error message to display when the dropdown value is invalid.
     */
    errorMessage?: string;
    /**
     * The key of the selected dropdown option.
     */
    selectedKey?: string;
    /**
     * The options for the dropdown.
     */
    options?: PropertyPaneDropDownOption[];
}
