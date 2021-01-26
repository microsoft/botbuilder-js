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
    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public convert(value: string[] | SettingMock[]): SettingMock[] {
        const settingMocks: SettingMock[] = [];
        value.forEach((item: string | SettingMock) => {
            if (typeof item === 'string') {
                const settingMock = this._resourceExplorer.loadType<SettingMock>(`${item}.dialog`);
                if (settingMock) {
                    settingMocks.push(settingMock);
                } else {
                    settingMocks.push(this._resourceExplorer.loadType<SettingMock>(item));
                }
            } else {
                const kind = item['$kind'];
                settingMocks.push(this._resourceExplorer.buildType<SettingMock, SettingMock>(kind, item));
            }
        });
        return settingMocks;
    }
}
