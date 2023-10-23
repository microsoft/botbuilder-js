// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';

export interface PropertyPaneGroupField {
    type: FieldType;
    targetProperty: string;
    properties: PropertyPaneFieldProperties;
    shouldFocus?: boolean;
}

export enum FieldType {
    CheckBox = 2,
    TextField = 3,
    Toggle = 5,
    Dropdown = 6,
    Label = 7,
    Slider = 8,
    ChoiceGroup = 10,
    HorizontalRule = 12,
    Link = 13,
}