// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPanePage } from './propertyPanePage';

export interface GetPropertyPaneConfigurationResponse {
    pages: [PropertyPanePage];
    currentPage: number;
    loadingIndicatorDelayTime: number;
    showLoadingIndicator: boolean;
}