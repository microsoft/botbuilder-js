import { ActivityTypes } from 'botbuilder-core';
import { Dialog } from 'botbuilder-dialogs';
import { OnActivity } from './onActivity';

export class OnHandoffActivity extends OnActivity {

    public static declarativeType = 'Microsoft.OnHandoffActivity';

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.Handoff, actions, condition);
    }
}