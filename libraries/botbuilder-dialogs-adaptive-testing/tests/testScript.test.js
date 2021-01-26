const assert = require('assert');
const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('TestScriptTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/TestScriptTests'),
        true,
        false
    );

    it('AssertReply_Assertions', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReply_Assertions');
    });

    it('AssertReply_AssertCondition', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertCondition');
    });

    it('AssertReply_Assertions_Failed', async () => {
        try {
            await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReply_Assertions_Failed');
        } catch (error) {
            assert(error.message.includes('"text":"hi User1"'), `assertion should have failed.`);
        }
    });

    it('AssertReply_Exact', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReply_Exact');
    });

    it('AssertReply_ExactInvalid', async () => {
        assert.rejects(async () => {
            await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReply_ExactInvalid');
        });
    });

    it('AssertReply_Invalid', async () => {
        assert.rejects(async () => {
            await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReply_Invalid');
        });
    });

    it('AssertReply_User', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReply_User');
    });

    it('AssertReplyOneOf_Assertions', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReplyOneOf_Assertions');
    });

    it('AssertReplyOneOf_Exact', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReplyOneOf_Exact');
    });

    it('AssertReplyOneOf_User', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReplyOneOf_User');
    });

    it('AssertReplyOneOf', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReplyOneOf');
    });

    it('CustomEvent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_CustomEvent');
    });

    it('HttpRequestMock', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_HttpRequestMock');
    });

    it('OAuthInputRetries_WithNullMessageText', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_OAuthInputRetries_WithNullMessageText');
    });

    it('PropertyMock', async () => {
        const origFile = process.env.file;
        process.env.file = 'set settings.file';

        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_PropertyMock');

        // Cleanup, restoring original process.env.file, if any.
        if (origFile) {
            process.env.file = origFile;
        } else {
            delete process.env.file;
        }
    });

    it('UserActivity', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_UserActivity');
    });

    it('UserConversationUpdate', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_UserConversationUpdate');
    });

    it('UserTokenMock', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_UserTokenMock');
    });

    it('UserTyping', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_UserTyping');
    });
});
