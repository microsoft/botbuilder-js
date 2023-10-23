// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * SharePoint Ace Data object
 */
export interface AceData {
    cardSize: AceCardSize;
    dataVersion: string;
    id: string;
    title: string;
    iconProperty: string;
    description: string;
    properties: any;
}

/**
 * SharePoint Ace Card Size
 */
export type AceCardSize = "Medium" | "Large";