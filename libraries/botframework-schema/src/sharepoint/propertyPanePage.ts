// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneGroupOrConditionalGroup } from './propertyPaneGroupOrConditionalGroup';
import { PropertyPanePageHeader } from './propertyPanePageHeader';

/**
 * SharePoint property pane page.
 */
export interface PropertyPanePage {
    /**
     * Whether the groups should be displayed as an accordion or not.
     */
    displayGroupsAsAccordion?: boolean;
    /**
     * The groups to be rendered inside this page.
     */
    groups: PropertyPaneGroupOrConditionalGroup[];
    /**
     * The header to be rendered inside this page.
     */
    header?: PropertyPanePageHeader;
}
