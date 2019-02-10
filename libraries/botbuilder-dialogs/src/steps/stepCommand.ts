/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export enum StepCommandType {
    endDialog = 'endDialog',
    replaceDialog = 'replaceDialog',
    repeatDialog = 'repeatDialog'
}

export class StepCommand {
    public type: StepCommandType;
    public result?: any;
    public dialogId?: string;
    public dialogOptions?: object;
}