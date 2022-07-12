/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Configurable, Converter } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

/**
 * Abstract class for mocking settings.
 */
export abstract class SettingMock extends Configurable {}

/**
 * The type converters for SettingMock.
 */
export class SettingMocksConverter implements Converter<string[], SettingMock[]> {
    constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    convert(value: (string | SettingMock)[]): SettingMock[] {
        return value.map((item: string | SettingMock) => {
            if (typeof item === 'string') {
                const settingMock = this._resourceExplorer.loadType<SettingMock>(`${item}.dialog`);
                if (settingMock) {
                    return settingMock;
                } else {
                    return this._resourceExplorer.loadType<SettingMock>(item);
                }
            } else {
                const kind = item['$kind'];
                return this._resourceExplorer.buildType<SettingMock, SettingMock>(kind, item);
            }
        });
    }
}
