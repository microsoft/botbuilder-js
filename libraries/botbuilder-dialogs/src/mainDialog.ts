/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StatePropertyAccessor, TurnContext } from 'botbuilder-core';
import { ComponentDialog } from './componentDialog';
import { DialogTurnResult, DialogTurnStatus } from './dialog';
import { DialogState } from './dialogContext';
import { DialogSet } from './dialogSet';


const MAIN_DIALOG_ID: string = 'main';

export class MainDialog extends ComponentDialog {

    constructor(protected readonly dialogState: StatePropertyAccessor<DialogState>) {
        super(MAIN_DIALOG_ID);
    }

    public async run(context: TurnContext): Promise<DialogTurnResult> {
        // Spin up a temporary dialog set and add ourselves to it.
        const dialogs = new DialogSet(this.dialogState);
        dialogs.add(this);

        // Create a dialog context and try to continue running the current dialog
        const dc = await dialogs.createContext(context);
        let result = await dc.continueDialog();

        // Start the main dialog if there wasn't a running one
        if (result.status === DialogTurnStatus.empty) {
            result = await dc.beginDialog(MAIN_DIALOG_ID);
        }
        return result;
    }
}