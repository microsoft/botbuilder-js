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
     * The value of this property is stored in the serialized data of the Adaptive Card Extension.
     * It can be used to manage versioning of the Adaptive Card Extension.
     *
     * @remarks - although there is no restriction on the format of this property, it is recommended to use semantic versioning.
     */
    dataVersion: string;
    /**
     * The unique id (Guid) of the ACE.
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
     * The visibility of the Adaptive Card Extension.
     * true if not specified.
     */
    isVisible?: boolean;
    /**
     * The properties of the ACE.
     */
    properties: any;
}

/**
 * SharePoint ACE Card Size
 */
export type AceCardSize = 'Medium' | 'Large';
