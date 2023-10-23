// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneChoiceGroupIconProperties } from './propertyPaneChoiceGroupIconProperties';
import { PropertyPaneChoiceGroupImageSize } from './propertyPaneChoiceGroupImageSize';

export interface PropertyPaneChoiceGroupOption {
    ariaLabel: string;
    disabled: boolean;
    checked: boolean;
    iconProps: PropertyPaneChoiceGroupIconProperties;
    imageSize: PropertyPaneChoiceGroupImageSize;
    imageSrc: string;
    key: string;
    text: string;
}