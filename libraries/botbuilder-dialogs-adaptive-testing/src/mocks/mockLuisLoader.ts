/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LuisAdaptiveRecognizer, LuisAdaptiveRecognizerConfiguration } from 'botbuilder-ai';
import { Recognizer } from 'botbuilder-dialogs';
import { CustomDeserializer, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { Newable } from 'botbuilder-stdlib';
import { MockLuisRecognizer } from './mockLuisRecognizer';

/**
 * Custom json deserializer for mocking luis.
 */
export class MockLuisLoader implements CustomDeserializer<MockLuisRecognizer, LuisAdaptiveRecognizerConfiguration> {
    private _appId = '.appId';

    /**
     * Initializes a new instance of the MockLuisLoader class.
     *
     * @param {ResourceExplorer} _resourceExplorer ResourceExplorer to use.
     * @param {Record<string, string>} _configuration Configuration to use.
     */
    constructor(private _resourceExplorer: ResourceExplorer, private _configuration?: Record<string, string>) {}

    /**
     * @param config Config to recognize intents and entities in a users utterance.
     * @param type Cached LUIS responses for testing.
     * @returns The new object created from the object parameter.
     */
    load(config: LuisAdaptiveRecognizerConfiguration, type: Newable<MockLuisRecognizer>): MockLuisRecognizer {
        const recognizer = new LuisAdaptiveRecognizer().configure(config as Record<string, unknown>);
        const externalEntityRecognizer = config.externalEntityRecognizer;
        if (typeof externalEntityRecognizer === 'string') {
            recognizer.externalEntityRecognizer = this._resourceExplorer.loadType<Recognizer>(
                `${externalEntityRecognizer}.dialog`
            );
        }
        let name = recognizer.applicationId.toString();
        if (name.startsWith('=')) {
            if (name.endsWith(this._appId)) {
                name = name.substr(0, name.length - this._appId.length);
            }
            const start = name.lastIndexOf('.') + 1;
            name = name.substr(start);
        }
        const resourceDir = this._configuration ? this._configuration['luis:resources'] : __dirname;
        return new type(recognizer, resourceDir, name);
    }
}
