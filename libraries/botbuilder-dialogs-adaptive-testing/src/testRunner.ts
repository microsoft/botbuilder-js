/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { QnAMakerComponentRegistration, LuisComponentRegistration } from 'botbuilder-ai';
import { ComponentRegistration, TestAdapter } from 'botbuilder-core';
import { AdaptiveComponentRegistration } from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { AdaptiveTestComponentRegistration } from './adaptiveTestComponentRegistration';
import { TestScript } from './testScript';

/**
 * In charge of running Dialog Adaptive tests.
 */
export class TestRunner {
    /**
     * Initializes a new instance of the `TestRunner` class.
     * @param resourcePath Path where the `.dialog` files are located.
     */
    public constructor(private resourcePath: string) {
        ComponentRegistration.add(new AdaptiveComponentRegistration());
        ComponentRegistration.add(new AdaptiveTestComponentRegistration());
        ComponentRegistration.add(new QnAMakerComponentRegistration());
        ComponentRegistration.add(new LuisComponentRegistration());
    }

    /**
     * Runs a test script with the specified name.
     * @param testName Test name.
     * @returns A Promise that represents the work queued to execute.
     */
    public runTestScript(testName: string): Promise<void> {
        // Construct a fresh test adapter
        const testAdapter = new TestAdapter(TestAdapter.createConversation('botbuilder-dialogs-adaptive-testing'));

        // Construct a fresh resourceExplorer
        const resourceExplorer = new ResourceExplorer();
        resourceExplorer.addFolder(this.resourcePath, true, false);

        const script = resourceExplorer.loadType<TestScript>(`${testName}.test.dialog`);
        script.description = script.description || testName;

        return script.execute(resourceExplorer, testName, testAdapter);
    }
}
