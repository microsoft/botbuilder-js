// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';

/**
 * SharePoint property pane label properties.
 */
export interface PropertyPaneLabelProperties extends PropertyPaneFieldProperties {
    /**
     * The text to display in the label.
     */
    text: string;
    /**
     * Whether the label is required or not.
     */
    required?: boolean;
}
