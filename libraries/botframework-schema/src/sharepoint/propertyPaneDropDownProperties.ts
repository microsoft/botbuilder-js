// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';
import { PropertyPaneDropDownOption } from './propertyPaneDropDownOptions';

export interface PropertyPaneDropDownProperties extends PropertyPaneFieldProperties {
    ariaLabel: string;
    ariaPositionInSet: number;
    ariaSetSize: number;
    label: string;
    disabled: boolean;
    errorMessage: string;
    selectedKey: string;
    options: [PropertyPaneDropDownOption];
}