// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { QuickViewData } from './quickViewData';
import { AdaptiveCard } from 'adaptivecards';
import { FocusParameters } from './actions/focusParameters';
import { ExternalLinkActionParameters } from './actions/cardAction';

/**
 * SharePoint ACE Quick view response payload.
 */
export interface QuickViewResponse {
    /**
     * The quick view data.
     */
    data: QuickViewData;
    /**
     * The adaptive card template for the quick view.
     */
    template: AdaptiveCard;
    /**
     * The view id.
     */
    viewId: string;
    /**
     * The title of the quick view.
     */
    title: string;
    /**
     * An optional external link to be displayed in the navigation bar above the Adaptive Card.
     */
    externalLink: ExternalLinkActionParameters;
    /**
     * An optional focus element to set focus when the view is rendered for accessibility purposes.
     */
    focusParameters: FocusParameters;
}
