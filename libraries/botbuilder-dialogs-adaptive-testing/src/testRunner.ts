/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ComponentRegistration } from 'botbuilder-core';
import { AdaptiveComponentRegistration } from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { AdaptiveTestComponentRegistration } from './adaptiveTestComponentRegistration';
import { AdaptiveTestAdapter } from './adaptiveTestAdapter';
import { TestScript } from './testScript';

export class TestRunner {
    private resourceExplorer: ResourceExplorer;
    private testAdapter: AdaptiveTestAdapter;

    public constructor(resourcePath: string) {
        ComponentRegistration.add(new AdaptiveComponentRegistration());
        ComponentRegistration.add(new AdaptiveTestComponentRegistration());

        this.resourceExplorer = new ResourceExplorer();
        this.resourceExplorer.addFolder(resourcePath, true, false);

        this.testAdapter = new AdaptiveTestAdapter(AdaptiveTestAdapter.createConversation('botbuilder-dialogs-adaptive-testing'));
    }

    public async runTestScript(testName: string): Promise<any> {
        const script = this.resourceExplorer.loadType(`${ testName }.test.dialog`) as TestScript;
        script.description = script.description || testName;
        this.testAdapter.activeQueue = [];
        await script.execute(this.resourceExplorer, testName, this.testAdapter);
    }
}