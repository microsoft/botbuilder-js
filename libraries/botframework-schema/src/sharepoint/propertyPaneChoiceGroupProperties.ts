// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';
import { PropertyPaneChoiceGroupOption } from './propertyPaneChoiceGroupOption';

/**
 * SharePoint property pane choice group field properties.
 */
export interface PropertyPaneChoiceGroupProperties extends PropertyPaneFieldProperties {
    /**
     * The label text to display next to the choice group.
     */
    label?: string;
    /**
     * The options for the choice group.
     */
    options: PropertyPaneChoiceGroupOption[];
}
