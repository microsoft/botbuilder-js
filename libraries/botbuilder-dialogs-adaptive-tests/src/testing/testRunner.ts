/**
 * @module botbuilder-dialogs-adaptive-tests
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { LanguageGeneratorMiddleWare } from 'botbuilder-dialogs-adaptive';
import { TypeFactory, TypeLoader, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { AdaptiveComponentRegistration } from '../adaptiveComponentRegistration';
import { AdaptiveTestComponentRegistration } from '../adaptiveTestComponentRegistration';
import { AdaptiveTestAdapter } from './adaptiveTestAdapter';
import { TestScript } from './testScript';
import * as fs from 'fs';
import * as path from 'path';

export class TestRunner {
    private typeLoader: TypeLoader;
    private testAdapter: AdaptiveTestAdapter;

    public constructor(private resourcePath: string) {
        const typeFactory = new TypeFactory();
        const resourceExplorer = new ResourceExplorer();
        resourceExplorer.addFolder(this.resourcePath, true, false);

        this.typeLoader = new TypeLoader(typeFactory, resourceExplorer);
        this.typeLoader.addComponent(new AdaptiveComponentRegistration());
        this.typeLoader.addComponent(new AdaptiveTestComponentRegistration());

        const lgResourceExplorer = ResourceExplorer.loadProject('resources/lg', [], false);
        this.testAdapter = new AdaptiveTestAdapter(AdaptiveTestAdapter.createConversation('botbuilder-dialogs-adaptive-tests'));
        this.testAdapter.use(new LanguageGeneratorMiddleWare(lgResourceExplorer));

    }

    public async runTestScript(testName: string) {
        const json = await TestRunner.readPackageJson(path.join(this.resourcePath, `${testName}.test.dialog`));
        const script = await this.typeLoader.load(json) as TestScript;
        script.description = script.description || testName;
        this.testAdapter.activeQueue = [];
        await script.execute(testName, this.testAdapter);
    }

    public static readPackageJson(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, buffer) => {
                if (err) { reject(err); }
                const json = JSON.parse(buffer.toString().trim());
                resolve(json);
            });
        });
    };
}