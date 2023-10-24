// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * SharePoint ACE Data object
 */
export interface AceData {
    /**
     * The card size.
     */
    cardSize: AceCardSize;
    /**
     * The version of the ACE data schema.
     */
    dataVersion: string;
    /**
     * The id of the ACE.
     */
    id: string;
    /**
     * The title of the ACE.
     */
    title: string;
    /**
     * The icon of the ACE.
     */
    iconProperty: string;
    /**
     * The description of the ACE.
     */
    description: string;
    /**
     * The properties of the ACE.
     */
    properties: any;
}

/**
 * SharePoint ACE Card Size
 */
export type AceCardSize = 'Medium' | 'Large';