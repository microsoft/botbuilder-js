// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';
import { PropertyPaneLinkPopupWindowProperties } from './propertyPaneLinkPopupWindowProperties';

/**
 * SharePoint property pane link field properties.
 */
export interface PropertyPaneLinkProperties extends PropertyPaneFieldProperties {
    /**
     * The text to display in the link.
     */
    text: string;
    /**
     * The target of the link.
     */
    target?: string;
    /**
     * The URL of the link.
     */
    href: string;
    /**
     * Optional ariaLabel flag. Text for screen-reader to announce regardless of toggle state.
     */
    ariaLabel?: string;
    /**
     * Whether the link is disabled or not.
     */
    disabled?: boolean;
    /**
     * The properties of the popup window.
     */
    popupWindowProps?: PropertyPaneLinkPopupWindowProperties;
}
