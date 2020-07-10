/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogManager } from 'botbuilder-dialogs';
import { BotTelemetryClient } from 'botbuilder-core';


export const telemetryClientKey = Symbol('telemetryClient');

export class TelemetryExtensions {
    /**
     * Configures the telemetry client to use.
     * @param dialogManager DialogManager to configure.
     * @param telemetryClient BotTelemetryClient instance to use.
     * @returns DialogManager.
     */
    public static useTelemetry(dialogManager: DialogManager, telemetryClient: BotTelemetryClient): DialogManager {
        dialogManager.initialTurnState.set(telemetryClientKey, telemetryClient);
        dialogManager.dialogs.telemetryClient = telemetryClient;
        return dialogManager;
    }
}