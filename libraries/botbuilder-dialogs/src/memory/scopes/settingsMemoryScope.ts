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
 * SettingsMemoryScope maps "settings" -> process.env
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

    public constructor() {
        super(ScopePath.settings, false);
    }

    public getMemory(dc: DialogContext): object {
<<<<<<< HEAD
        // Clone strings from env
        const settings: object = {};
=======
        let settings: Record<string, unknown> = {};
        if (dc.context.turnState.has(ScopePath.settings)) {
            settings = dc.context.turnState.get(ScopePath.settings);
        }
>>>>>>> 7dd1ecc3 (fix conflict)
        for (const key in process.env) {
            if (!SettingsMemoryScope.blockingList.some(u => u.toLowerCase() === key.toLowerCase()) && typeof process.env[key] == 'string') {
                settings[key] = process.env[key];
            }
        }

        return settings;
    }
}
