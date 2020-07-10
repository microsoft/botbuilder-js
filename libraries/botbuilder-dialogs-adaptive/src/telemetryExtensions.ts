/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogManager } from 'botbuilder-dialogs';
import { BotTelemetryClient } from 'botbuilder-core';

declare module 'botbuilder-dialogs/lib/dialogManager' {
    export interface DialogManager {
        useTelemetry(telemetryClient: BotTelemetryClient): DialogManager;
    }
}

export const telemetryClientKey = Symbol('telemetryClient');

/**
 * Configures the telemetry client to use.
 */
DialogManager.prototype.useTelemetry = function(telemetryClient: BotTelemetryClient): DialogManager {
    const _self = this as DialogManager;
    _self.initialTurnState.set(telemetryClientKey, telemetryClient);
    return _self;
};