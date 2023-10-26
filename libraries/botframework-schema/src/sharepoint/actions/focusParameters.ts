// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * Interface to give third party developers the capability to determine which element should recieve focus, when, and how often content should be read.
 */
export interface FocusParameters {
    /**
     * Sets the default focus on the DOM. Developers pass in the id of a unique element that is to attain focus within a quick view.
     * If the `focusTarget` is not defined then the root element is selected.
     */
    focusTarget?: string;
    /**
     * Sets the accessibility reading of the contents within the focus target.
     * Polite - Content in the target's subtree is read when the user is idle.
     * Assertive - Disrupts any announcement in favor of the changed contents within the target's subtree.
     * Off - The screen reader will not read contents within the target's subtree.
     */
    ariaLive?: 'polite' | 'assertive' | 'off';
}
