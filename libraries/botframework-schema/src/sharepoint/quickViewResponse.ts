// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { QuickViewData } from './quickViewData';
import { AdaptiveCard } from 'adaptivecards';
import { FocusParameters } from './actions/focusParameters';
import { ExternalLinkActionParameters } from './actions/cardAction';

export interface QuickViewResponse {
    data: QuickViewData;
    template: AdaptiveCard;
    viewId: string;
    title: string;
    externalLink: ExternalLinkActionParameters;
    focusParameters: FocusParameters;
}