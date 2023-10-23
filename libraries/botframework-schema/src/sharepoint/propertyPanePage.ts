// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneGroupOrConditionalGroup } from './propertyPaneGroupOrConditionalGroup';
import { PropertyPanePageHeader } from './propertyPanePageHeader';

export interface PropertyPanePage {
    displayGroupsAsAccordion: boolean;
    groups: [PropertyPaneGroupOrConditionalGroup];
    header: PropertyPanePageHeader;
}