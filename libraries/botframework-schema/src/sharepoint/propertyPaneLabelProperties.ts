// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';

export interface PropertyPaneLabelProperties extends PropertyPaneFieldProperties {
    text: string;
    required: boolean;
}