// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';

/**
 * SharePoint property pane group field.
 */
export interface PropertyPaneGroupField {
    /**
     * The type of the field.
     */
    type: FieldType;
    /**
     * The target property for the field.
     */
    targetProperty: string;
    /**
     * The properties for the field.
     */
    properties: PropertyPaneFieldProperties;
    /**
     * Indicates whether the field should be focused or not.
     */
    shouldFocus?: boolean;
}

/**
 * SharePoint property pane group field type.
 */
export enum FieldType {
    /**
     * Checkbox field.
     */
    CheckBox = 2,
    /**
     * Text field.
     */
    TextField = 3,
    /**
     * Toggle field.
     */
    Toggle = 5,
    /**
     * Dropdown field.
     */
    Dropdown = 6,
    /**
     * Label field.
     */
    Label = 7,
    /**
     * Slider field.
     */
    Slider = 8,
    /**
     * Choice Group field.
     */
    ChoiceGroup = 10,
    /**
     * Horizontal Rule field.
     */
    HorizontalRule = 12,
    /**
     * Link field.
     */
    Link = 13,
}
