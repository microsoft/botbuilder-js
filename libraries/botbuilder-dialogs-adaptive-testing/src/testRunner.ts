/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TestAdapter } from 'botbuilder-core';
import { AdaptiveDialogComponentRegistration } from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { AdaptiveDialogTestComponentRegistration } from './adaptiveDialogTestComponentRegistration';
import { TestScript } from './testScript';

/**
 * In charge of running Dialog Adaptive tests.
 */
export class TestRunner {
    private resourceExplorer: ResourceExplorer;
    private testAdapter: TestAdapter;

    /**
     * Initializes a new instance of the `TestRunner` class.
     * @param resourcePath Path where the `.dialog` files are located.
     */
    public constructor(resourcePath: string) {
        this.resourceExplorer = new ResourceExplorer();
        this.resourceExplorer.addFolder(resourcePath, true, false);
        this.resourceExplorer.addComponent(new AdaptiveDialogComponentRegistration(this.resourceExplorer));
        this.resourceExplorer.addComponent(new AdaptiveDialogTestComponentRegistration(this.resourceExplorer));

        this.testAdapter = new TestAdapter(TestAdapter.createConversation('botbuilder-dialogs-adaptive-testing'));
    }

    /**
     * Runs a test script with the specified name.
     * @param testName Test name.
     * @returns A Promise that represents the work queued to execute.
     */
    public async runTestScript(testName: string): Promise<any> {
        const script = this.resourceExplorer.loadType(`${ testName }.test.dialog`) as TestScript;
        script.description = script.description || testName;
        this.testAdapter.activeQueue.splice(0, this.testAdapter.activeQueue.length);
        await script.execute(this.resourceExplorer, testName, this.testAdapter);
    }
}
