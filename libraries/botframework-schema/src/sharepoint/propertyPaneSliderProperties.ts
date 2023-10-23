// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';

export interface PropertyPaneSliderProperties extends PropertyPaneFieldProperties {
    label: string;
    value: string;
    ariaLabel: string;
    disabled: boolean;
    max: number;
    min: number;
    step: number;
    showValue: boolean;
}