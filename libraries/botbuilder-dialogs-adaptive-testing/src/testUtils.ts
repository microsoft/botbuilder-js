/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, TestAdapter } from 'botbuilder-core';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { TestScript } from './testScript';

/**
 * In charge of running Dialog Adaptive tests.
 */
export class TestUtils {
    /**
     * Runs a test script with the specified name.
     *
     * @param resourceExplorer Resource explorer used in test.
     * @param testName Test name.
     * @param adapter Test adapter.
     * @param configuration Test configuration.
     * @param middlewares Middlewares to be added in test.
     */
    static async runTestScript(
        resourceExplorer: ResourceExplorer,
        testName?: string,
        adapter?: TestAdapter,
        configuration?: Record<string, string>,
        ...middlewares: Middleware[]
    ): Promise<void> {
        const script = resourceExplorer.loadType<TestScript>(`${testName}.test.dialog`);
        script.configuration = configuration ?? {};
        script.description = script.description ?? testName;
        await script.execute(resourceExplorer, testName, undefined, adapter, ...middlewares);
    }
}
