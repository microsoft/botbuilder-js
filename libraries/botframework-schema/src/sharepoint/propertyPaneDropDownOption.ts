// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * SharePoint property pane drop down option.
 */
export interface PropertyPaneDropDownOption {
    /**
     * The index of the option.
     */
    index?: number;
    /**
     * The key to uniquely identify the option.
     */
    key: string;
    /**
     * The text to render for this option.
     */
    text: string;
    /**
     * The type of option to render.
     */
    type?: DropDownOptionType;
}

/**
 * SharePoint property pane drop down option type.
 */
export enum DropDownOptionType {
    /**
     * Render a normal option.
     */
    Normal = 0,
    /**
     * Render a divider.
     */
    Divider = 1,
    /**
     * Render a header.
     */
    Header = 2,
}
