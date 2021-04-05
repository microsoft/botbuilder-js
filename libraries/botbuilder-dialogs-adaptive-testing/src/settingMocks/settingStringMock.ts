/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { SettingMock } from './settingMock';

export interface SettingStringMockConfiguration {
    assignments: SettingStringAssignment[];
}

/**
 * Setting string assignment.
 */
export interface SettingStringAssignment {
    /**
     * The property path.
     */
    property: string;

    /**
     * Value string.
     */
    value: string;
}

/**
 * Mock one or more settings with string value.
 */
export class SettingStringMock extends SettingMock implements SettingStringMockConfiguration {
    static $kind = 'Microsoft.Test.SettingStringMock';

    /**
     * Setting assignments as settings.property=value pairs. Assign the settings in sequence.
     */
    public readonly assignments: SettingStringAssignment[] = [];
}
