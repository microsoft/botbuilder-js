/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BotTelemetryClient, telemetryClientKey } from 'botbuilder-core';
import { DialogManager } from 'botbuilder-dialogs';

/**
 * Extension methods for telemetry.
 * Configures the telemetry client to use.
 * @param dialogManager DialogManager to configure.
 * @param telemetryClient BotTelemetryClient instance to use.
 * @returns DialogManager.
 */
export function useTelemetry(dialogManager: DialogManager, telemetryClient: BotTelemetryClient): DialogManager {
    dialogManager.initialTurnState.set(telemetryClientKey, telemetryClient);
    dialogManager.dialogs.telemetryClient = telemetryClient;
    return dialogManager;
}
