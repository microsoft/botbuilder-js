/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import { LanguageGeneratorMiddleWare, AdaptiveDialogComponentRegistration } from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { AdaptiveDialogTestComponentRegistration } from './adaptiveDialogTestComponentRegistration';
import { AdaptiveTestAdapter } from './adaptiveTestAdapter';
import { TestScript } from './testScript';

export class TestRunner {
    private resourceExplorer: ResourceExplorer;
    private testAdapter: AdaptiveTestAdapter;

    public constructor(resourcePath: string) {
        this.resourceExplorer = new ResourceExplorer();
        this.resourceExplorer.addFolder(resourcePath, true, false);
        this.resourceExplorer.addComponent(new AdaptiveDialogComponentRegistration(this.resourceExplorer));
        this.resourceExplorer.addComponent(new AdaptiveDialogTestComponentRegistration(this.resourceExplorer));

        this.testAdapter = new AdaptiveTestAdapter(AdaptiveTestAdapter.createConversation('botbuilder-dialogs-adaptive-testing'));
        this.testAdapter.use(new LanguageGeneratorMiddleWare(new ResourceExplorer().addFolder(path.join(__dirname, '../tests/resources/lg'), false, false)));

    }

    public async runTestScript(testName: string): Promise<any> {
        const script = this.resourceExplorer.loadType(`${ testName }.test.dialog`) as TestScript;
        script.description = script.description || testName;
        this.testAdapter.activeQueue = [];
        await script.execute(testName, this.testAdapter);
    }
}