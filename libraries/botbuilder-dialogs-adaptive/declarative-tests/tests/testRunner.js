"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_declarative_1 = require("botbuilder-dialogs-declarative");
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_dialogs_adaptive_2 = require("botbuilder-dialogs-adaptive");
const fs = require("fs");
const path = require("path");
class TestRunner {
    constructor(resourcePath) {
        this.resourcePath = resourcePath;
        const typeFactory = new botbuilder_dialogs_declarative_1.TypeFactory();
        typeFactory.register(botbuilder_dialogs_adaptive_1.TestScript.declarativeType, new botbuilder_dialogs_declarative_1.DefaultTypeBuilder(botbuilder_dialogs_adaptive_1.TestScript));
        typeFactory.register(botbuilder_dialogs_adaptive_1.UserSays.declarativeType, new botbuilder_dialogs_declarative_1.DefaultTypeBuilder(botbuilder_dialogs_adaptive_1.UserSays));
        typeFactory.register(botbuilder_dialogs_adaptive_1.UserDelay.declarativeType, new botbuilder_dialogs_declarative_1.DefaultTypeBuilder(botbuilder_dialogs_adaptive_1.UserDelay));
        typeFactory.register(botbuilder_dialogs_adaptive_1.UserConversationUpdate.declarativeType, new botbuilder_dialogs_declarative_1.DefaultTypeBuilder(botbuilder_dialogs_adaptive_1.UserConversationUpdate));
        typeFactory.register(botbuilder_dialogs_adaptive_1.UserActivity.declarativeType, new botbuilder_dialogs_declarative_1.DefaultTypeBuilder(botbuilder_dialogs_adaptive_1.UserActivity));
        typeFactory.register(botbuilder_dialogs_adaptive_1.UserTyping.declarativeType, new botbuilder_dialogs_declarative_1.DefaultTypeBuilder(botbuilder_dialogs_adaptive_1.UserTyping));
        typeFactory.register(botbuilder_dialogs_adaptive_1.AssertReplyActivity.declarativeType, new botbuilder_dialogs_declarative_1.DefaultTypeBuilder(botbuilder_dialogs_adaptive_1.AssertReplyActivity));
        typeFactory.register(botbuilder_dialogs_adaptive_1.AssertReply.declarativeType, new botbuilder_dialogs_declarative_1.DefaultTypeBuilder(botbuilder_dialogs_adaptive_1.AssertReply));
        typeFactory.register(botbuilder_dialogs_adaptive_1.AssertReplyOneOf.declarativeType, new botbuilder_dialogs_declarative_1.DefaultTypeBuilder(botbuilder_dialogs_adaptive_1.AssertReplyOneOf));
        typeFactory.register(botbuilder_dialogs_adaptive_1.AssertCondition.declarativeType, new botbuilder_dialogs_declarative_1.DefaultTypeBuilder(botbuilder_dialogs_adaptive_1.AssertCondition));
        const resourceProvider = new botbuilder_dialogs_declarative_1.FileResourceProvider();
        resourceProvider.registerDirectory(this.resourcePath);
        this.typeLoader = new botbuilder_dialogs_declarative_1.TypeLoader(typeFactory, resourceProvider);
        this.typeLoader.addComponent(new botbuilder_dialogs_adaptive_2.AdaptiveComponentRegistration());
    }
    async runTestScript(testName) {
        const json = await TestRunner.readPackageJson(path.join(this.resourcePath, `${testName}.test.dialog`));
        const script = await this.typeLoader.load(json);
        script.description = script.description || testName;
        await script.execute(testName);
    }
    static readPackageJson(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, buffer) => {
                if (err) {
                    reject(err);
                }
                const json = JSON.parse(buffer.toString().trim());
                resolve(json);
            });
        });
    }
    ;
}
exports.TestRunner = TestRunner;
//# sourceMappingURL=testRunner.js.map