/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Middleware, TurnContext } from 'botbuilder-core';
import { DialogTurnStateConstants } from 'botbuilder-dialogs';
import { SettingMock } from '../settingMocks/settingMock';
import { SettingStringMock } from '../settingMocks/settingStringMock';

/**
 * Middleware which mocks settings properties.
 */
export class MockSettingsMiddleware implements Middleware {
    private readonly _mockData = new Map<string, string>();
    private _configured = false;
    private _configuredConfiguration: Record<string, string>;

    /**
     * Initializes a new instance of the [MockSettingsMiddleware](botbuilder-dialogs-adaptive-testing.MockSettingsMiddleware) class.
     *
     * @param {SettingMock[]} settingMocks Settings to mock.
     */
    constructor(settingMocks: SettingMock[]) {
        settingMocks.forEach((property) => {
            if (property instanceof SettingStringMock) {
                const mock = property;
                mock.assignments.forEach((assignment) => {
                    // Note that settings use : as separator
                    const newProperty = assignment.property.replace(/\./g, ':');
                    this._mockData.set(newProperty, assignment.value);
                });
            }
        });
    }

    /**
     * Processes an incoming activity.
     *
     * @param context The context object for this turn.
     * @param next The delegate to call to continue the bot middleware pipeline.
     */
    async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (!this._configured) {
            if (this._mockData.size) {
                // We assume bot will use TurnState to store settings' configuration.
                this._configuredConfiguration = context.turnState.get(DialogTurnStateConstants.configuration) ?? {};
                this._mockData.forEach((value, key) => {
                    this._configuredConfiguration[key] = value;
                });
                this._mockData.clear();
            }
            this._configured = true;
        }

        if (this._configuredConfiguration) {
            context.turnState.set(DialogTurnStateConstants.configuration, this._configuredConfiguration);
        }

        await next();
    }
}
