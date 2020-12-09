// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation. All rights reserved.

import { Dialog } from 'botbuilder-dialogs';
import { OnInvokeActivity } from 'botbuilder-dialogs-adaptive';

export class OnTeamsAppBasedLinkQuery extends OnInvokeActivity {
    public static $kind = 'Teams.OnAppBasedLinkQuery';

    constructor(actions: Dialog[] = [], condition?: string) {
        super(actions, condition);
    }
}
