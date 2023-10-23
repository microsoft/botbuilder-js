// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';

export interface PropertyPaneCheckboxProperties extends PropertyPaneFieldProperties {
    text: string;
    disabled: boolean;
    checked: boolean;
}