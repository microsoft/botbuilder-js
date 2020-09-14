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

export class TestRunner {
    private resourceExplorer: ResourceExplorer;
    private testAdapter: TestAdapter;

    public constructor(resourcePath: string) {
        this.resourceExplorer = new ResourceExplorer();
        this.resourceExplorer.addFolder(resourcePath, true, false);
        this.resourceExplorer.addComponent(new AdaptiveDialogComponentRegistration(this.resourceExplorer));
        this.resourceExplorer.addComponent(new AdaptiveDialogTestComponentRegistration(this.resourceExplorer));

        this.testAdapter = new TestAdapter(TestAdapter.createConversation('botbuilder-dialogs-adaptive-testing'));
    }

    public async runTestScript(testName: string): Promise<any> {
        const script = this.resourceExplorer.loadType(`${ testName }.test.dialog`) as TestScript;
        script.description = script.description || testName;
        this.testAdapter.activeQueue.splice(0, this.testAdapter.activeQueue.length);
        await script.execute(this.resourceExplorer, testName, this.testAdapter);
    }
}