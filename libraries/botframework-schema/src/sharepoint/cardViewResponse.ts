// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AceData } from './aceData';
import { OnCardSelectionAction } from './actions/cardAction';
import { CardViewParameters } from './cardView/cardViewParameters';

export interface CardViewResponse {
    aceData: AceData;
    cardViewParameters: CardViewParameters;
    onCardSelection: OnCardSelectionAction;
    viewId: string;
}