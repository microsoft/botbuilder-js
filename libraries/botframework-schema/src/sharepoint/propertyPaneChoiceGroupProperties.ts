// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';
import { PropertyPaneChoiceGroupOption } from './propertyPaneChoiceGroupOption';

export interface PropertyPaneChoiceGroupProperties extends PropertyPaneFieldProperties {
    label: string;
    options: [PropertyPaneChoiceGroupOption];
}