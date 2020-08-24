/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogState } from 'botbuilder-dialogs';

export interface ActionState extends DialogState {
    dialogId: string;
    options?: object;
}
