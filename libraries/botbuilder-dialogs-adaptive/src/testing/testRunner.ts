import { TypeFactory, TypeLoader, ResourceExplorer } from "botbuilder-dialogs-declarative";
import { AdaptiveComponentRegistration } from "../adaptiveComponentRegistration";
import { AdaptiveTestComponentRegistration } from "../adaptiveTestComponentRegistration";
import { TestScript } from "./testScript";
import * as fs from 'fs';
import * as path from 'path';

export class TestRunner {
    private typeLoader: TypeLoader;

    constructor(private resourcePath: string) {
        const typeFactory = new TypeFactory();
        const resourceExplorer = new ResourceExplorer();
        resourceExplorer.addFolder(this.resourcePath, true, false);

        this.typeLoader = new TypeLoader(typeFactory, resourceExplorer);
        this.typeLoader.addComponent(new AdaptiveComponentRegistration());
        this.typeLoader.addComponent(new AdaptiveTestComponentRegistration());
    }

    public async runTestScript(testName: string) {
        const json = await TestRunner.readPackageJson(path.join(this.resourcePath, `${testName}.test.dialog`));
        const script = await this.typeLoader.load(json) as TestScript;
        script.description = script.description || testName;
        await script.execute(testName);
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