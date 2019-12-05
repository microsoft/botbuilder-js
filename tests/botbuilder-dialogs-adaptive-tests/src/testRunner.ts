import { TypeFactory, DefaultTypeBuilder, FileResourceProvider, TypeLoader } from "botbuilder-dialogs-declarative";
import {
    TestScript, UserSays, UserDelay, UserConversationUpdate, UserActivity,
    UserTyping, AssertReplyActivity, AssertReply, AssertReplyOneOf, AssertCondition
} from "botbuilder-dialogs-adaptive";
import * as fs from 'fs';
import * as path from 'path';

export class TestRunner {
    private typeLoader: TypeLoader;

    constructor(private resourcePath: string) {
        const typeFactory = new TypeFactory();
        typeFactory.register(TestScript.declarativeType, new DefaultTypeBuilder(TestScript));
        typeFactory.register(UserSays.declarativeType, new DefaultTypeBuilder(UserSays));
        typeFactory.register(UserDelay.declarativeType, new DefaultTypeBuilder(UserDelay));
        typeFactory.register(UserConversationUpdate.declarativeType, new DefaultTypeBuilder(UserConversationUpdate));
        typeFactory.register(UserActivity.declarativeType, new DefaultTypeBuilder(UserActivity));
        typeFactory.register(UserTyping.declarativeType, new DefaultTypeBuilder(UserTyping));
        typeFactory.register(AssertReplyActivity.declarativeType, new DefaultTypeBuilder(AssertReplyActivity));
        typeFactory.register(AssertReply.declarativeType, new DefaultTypeBuilder(AssertReply));
        typeFactory.register(AssertReplyOneOf.declarativeType, new DefaultTypeBuilder(AssertReplyOneOf));
        typeFactory.register(AssertCondition.declarativeType, new DefaultTypeBuilder(AssertCondition));

        const resourceProvider = new FileResourceProvider();
        resourceProvider.registerDirectory(this.resourcePath);

        this.typeLoader = new TypeLoader(typeFactory, resourceProvider);
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