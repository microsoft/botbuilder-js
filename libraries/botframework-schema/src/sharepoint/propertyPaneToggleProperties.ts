// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';

export interface PropertyPaneToggleProperties extends PropertyPaneFieldProperties {
    ariaLabel: string;
    label: string;
    disabled: boolean;
    checked: boolean;
    key: string;
    offText: string;
    onText: string;
    onAriaLabel: string;
    offAriaLabel: string;
}