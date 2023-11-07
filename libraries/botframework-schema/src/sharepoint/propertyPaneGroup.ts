// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneGroupOrConditionalGroup } from './propertyPaneGroupOrConditionalGroup';
import { PropertyPaneGroupField } from './propertyPaneGroupField';

/**
 * SharePoint property pane group.
 */
export interface PropertyPaneGroup extends PropertyPaneGroupOrConditionalGroup {
    /**
     * The fields to be rendered inside this group.
     */
    groupFields: PropertyPaneGroupField[];
    /**
     * The name of the group.
     */
    groupName?: string;
    /**
     * Whether the group is collapsed or not.
     */
    isCollapsed?: boolean;
    /**
     * Whether the group name is hidden or not.
     */
    isGroupNameHidden?: boolean;
}
