/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// A geographic location.
export interface GeographyV2 {
    /**
     * Type of location.
     */
    type: GeographyV2Type;

    /**
     * Name of location.
     */
    location: string;
}

export enum GeographyV2Type {
    POI = "poi",
    City = "city",
    CountryRegion = "countryRegion",
    Continent = "continent",
    State = "state"
}
