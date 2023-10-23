// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export interface PropertyPaneLinkPopupWindowProperties {
    width: number;
    height: number;
    title: string;
    positionWindowPosition: PopupWindowPosition;
}

export enum PopupWindowPosition {
    Center = 0,
    RightTop = 1,
    LeftTop = 2,
    RightBottom = 3,
    LeftBottom = 4
}