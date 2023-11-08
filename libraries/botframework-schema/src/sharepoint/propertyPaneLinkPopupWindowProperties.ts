// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * SharePoint property pane link popup window properties.
 */
export interface PropertyPaneLinkPopupWindowProperties {
    /**
     * The width of the popup window.
     */
    width: number;
    /**
     * The height of the popup window.
     */
    height: number;
    /**
     * The title of the popup window.
     */
    title: string;
    /**
     * The position of the popup window.
     */
    positionWindowPosition: PopupWindowPosition;
}

/**
 * SharePoint property pane link popup window position.
 */
export enum PopupWindowPosition {
    /**
     * Center.
     */
    Center = 0,
    /**
     * Right top.
     */
    RightTop = 1,
    /**
     * Left top.
     */
    LeftTop = 2,
    /**
     * Right bottom.
     */
    RightBottom = 3,
    /**
     * Left bottom.
     */
    LeftBottom = 4,
}
