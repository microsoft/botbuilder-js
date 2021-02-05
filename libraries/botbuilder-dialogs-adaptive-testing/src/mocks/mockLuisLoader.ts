/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LuisAdaptiveRecognizer, LuisAdaptiveRecognizerConfiguration } from 'botbuilder-ai';
import { CustomDeserializer } from 'botbuilder-dialogs-declarative';
import { MockLuisRecognizer } from './mockLuisRecognizer';

/**
 * Custom json deserializer for mocking luis.
 */
export class MockLuisLoader implements CustomDeserializer<MockLuisRecognizer, LuisAdaptiveRecognizerConfiguration> {
    private _appId = '.appId';
    private _configuration: Record<string, string>;

    /**
     * Initializes a new instance of the MockLuisLoader class.
     *
     * @param {Record<string, string>} configuration Configuration to use.
     */
    public constructor(configuration?: Record<string, string>) {
        this._configuration = configuration;
    }

    public load(
        config: LuisAdaptiveRecognizerConfiguration,
        type: new (...args: unknown[]) => MockLuisRecognizer
    ): MockLuisRecognizer {
        const recognizer = new LuisAdaptiveRecognizer().configure(config as Record<string, unknown>);
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
