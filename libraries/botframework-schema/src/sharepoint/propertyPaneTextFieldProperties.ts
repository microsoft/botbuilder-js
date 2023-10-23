// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';

export interface PropertyPaneTextFieldProperties extends PropertyPaneFieldProperties {
    label: string;
    value: string;
    ariaLabel: string;
    deferredValidationTime: number;
    description: string;
    disabled: boolean;
    errorMessage: string;
    logName: string;
    maxLength: number;
    multiline: boolean;
    placeholder: string;
    resizable: boolean;
    rows: number;
    underlined: boolean;
    validateOnFocusIn: boolean;
    validateOnFocusOut: boolean;
}