// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AceData } from './aceData';
import { OnCardSelectionAction } from './actions/cardAction';
import { CardViewParameters } from './cardView/cardViewParameters';

/**
 * SharePoint ACE Card view response payload.
 */
export interface CardViewResponse {
    /**
     * The ACE data.
     */
    aceData: AceData;
    /**
     * The card view parameters.
     */
    cardViewParameters: CardViewParameters;
    /**
     * The on card selection action.
     */
    onCardSelection?: OnCardSelectionAction;
    /**
     * The view id.
     */
    viewId: string;
}
