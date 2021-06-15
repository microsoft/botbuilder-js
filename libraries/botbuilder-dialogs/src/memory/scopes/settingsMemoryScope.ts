/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { MemoryScope } from './memoryScope';
import { ScopePath } from '../scopePath';
import { DialogContext } from '../../dialogContext';

/**
 * SettingsMemoryScope maps "settings" -> dc.context.turnState['settings']
 */
export class SettingsMemoryScope extends MemoryScope {
    private static readonly blockingList = [
        'MicrosoftAppPassword',
        'cosmosDb:authKey',
        'blobStorage:connectionString',
        'BlobsStorage:connectionString',
        'CosmosDbPartitionedStorage:authKey',
        'applicationInsights:connectionString',
        'applicationInsights:InstrumentationKey',
        'runtimeSettings:telemetry:options:connectionString',
        'runtimeSettings:telemetry:options:instrumentationKey',
        'runtimeSettings:features:blobTranscript:connectionString',
    ];

    /**
     * Initializes a new instance of the [SettingsMemoryScope](xref:botbuilder-dialogs.SettingsMemoryScope) class.
     */
    public constructor() {
        super(ScopePath.settings, false);
    }

    /**
     * Gets the backing memory for this scope.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) object for this turn.
     * @returns The memory for the scope.
     */
    public getMemory(dc: DialogContext): object {
        let settings: Record<string, unknown> = {};
        if (dc.context.turnState.has(ScopePath.settings)) {
            settings = dc.context.turnState.get(ScopePath.settings);
        }
        for (const key in process.env) {
            if (!SettingsMemoryScope.blockingList.some(u => u.toLowerCase() === key.toLowerCase()) && typeof process.env[key] == 'string') {
                settings[key] = process.env[key];
            }
        }
        return settings;
    }
}
