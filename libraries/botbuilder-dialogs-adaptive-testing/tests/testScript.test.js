const path = require('path');
const { TestRunner } = require('../lib');
const assert = require('assert');

describe('TestScriptTests', function () {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname, 'resources/TestScriptTests'));

    it('AssertReply_Assertions', async () => {
        await testRunner.runTestScript('TestScriptTests_AssertReply_Assertions');
    });

    it('AssertReply_AssertCondition', async () => {
        await testRunner.runTestScript('TestScriptTests_AssertCondition');
    });

    it('AssertReply_Exact', async () => {
        await testRunner.runTestScript('TestScriptTests_AssertReply_Exact');
    });

    it('AssertReply_ExactInvalid', async () => {
        assert.rejects(async () => {
            await testRunner.runTestScript('TestScriptTests_AssertReply_ExactInvalid');
        });
    });

    it('AssertReply_Invalid', async () => {
        assert.rejects(async () => {
            await testRunner.runTestScript('TestScriptTests_AssertReply_Invalid');
        });
    });

    it('AssertReply_User', async () => {
        await testRunner.runTestScript('TestScriptTests_AssertReply_User');
    });

    it('AssertReplyOneOf_Assertions', async () => {
        await testRunner.runTestScript('TestScriptTests_AssertReplyOneOf_Assertions');
    });

    it('AssertReplyOneOf_Exact', async () => {
        await testRunner.runTestScript('TestScriptTests_AssertReplyOneOf_Exact');
    });

    it('AssertReplyOneOf_User', async () => {
        await testRunner.runTestScript('TestScriptTests_AssertReplyOneOf_User');
    });

    it('AssertReplyOneOf', async () => {
        await testRunner.runTestScript('TestScriptTests_AssertReplyOneOf');
    });

    it('UserConversationUpdate', async () => {
        await testRunner.runTestScript('TestScriptTests_UserConversationUpdate');
    });

    it('UserTokenMock', async () => {
        await testRunner.runTestScript('TestScriptTests_UserTokenMock');
    });

    it('UserTyping', async () => {
        await testRunner.runTestScript('TestScriptTests_UserTyping');
    });
});
