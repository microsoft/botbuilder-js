// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';
import { PropertyPaneLinkPopupWindowProperties } from './propertyPaneLinkPopupWindowProperties';

export interface PropertyPaneLinkProperties extends PropertyPaneFieldProperties {
    text: string;
    target: string;
    href: string;
    ariaLabel: string;
    disabled: boolean;
    popupWindowProps: PropertyPaneLinkPopupWindowProperties;
}