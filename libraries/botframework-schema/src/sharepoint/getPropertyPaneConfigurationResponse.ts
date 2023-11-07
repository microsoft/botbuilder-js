// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPanePage } from './propertyPanePage';

/**
 * SharePoint ACE get property pane configuration response.
 */
export interface GetPropertyPaneConfigurationResponse {
    /**
     * Property pane pages.
     */
    pages: PropertyPanePage[];
    /**
     * Current page number.
     */
    currentPage: number;
    /**
     * Loading indicator delay time.
     */
    loadingIndicatorDelayTime: number;
    /**
     * Value indicating whether to show loading indicator on top of the property pane.
     */
    showLoadingIndicator: boolean;
}
