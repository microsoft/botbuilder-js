// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneGroupOrConditionalGroup } from './propertyPaneGroupOrConditionalGroup';
import { PropertyPaneGroupField } from './propertyPaneGroupField';

export interface PropertyPaneGroup extends PropertyPaneGroupOrConditionalGroup {
    groupFields: [PropertyPaneGroupField];
    groupName: string;
    isCollapsed: boolean;
    isGroupNameHidden: boolean;
}