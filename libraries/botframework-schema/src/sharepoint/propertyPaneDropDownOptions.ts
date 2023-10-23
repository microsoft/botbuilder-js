// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export interface PropertyPaneDropDownOption {
    index: number;
    key: string;
    text: string;
    type: DropDownOptionType;
}

export enum DropDownOptionType {
    // Render normal menu item
    Normal = 0,
    // Render a divider
    Divider = 1,
    // Render menu item as a header
    Header = 2
}