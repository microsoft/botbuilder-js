// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { PropertyPaneFieldProperties } from './propertyPaneFieldProperties';

/**
 * SharePoint property pane slider field properties.
 */
export interface PropertyPaneSliderProperties extends PropertyPaneFieldProperties {
    /**
     * The label of the slider.
     */
    label?: string;
    /**
     * The value of the slider.
     */
    value?: string;
    /**
     * Optional ariaLabel flag. Text for screen-reader to announce regardless of toggle state.
     */
    ariaLabel?: string;
    /**
     * Whether the slider is disabled or not.
     */
    disabled?: boolean;
    /**
     * The maximum value of the slider.
     */
    max: number;
    /**
     * The minimum value of the slider.
     */
    min: number;
    /**
     * The step value of the slider.
     */
    step?: number;
    /**
     * Whether to show the value on the right of the slider or no.
     */
    showValue?: boolean;
}
