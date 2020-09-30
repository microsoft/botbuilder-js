const assert = require ('assert');
const path = require('path');
const { TestRunner } = require('../lib');

describe('TestScriptTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  'resources/TestScriptTests'));

    it('AssertReply_Assertions', async () => {
        await testRunner.runTestScript('TestScriptTests_AssertReply_Assertions');
    });

    it('AssertReply_Assertions_Failed', async () => {
        try {
            await testRunner.runTestScript('TestScriptTests_AssertReply_Assertions_Failed');
        } 
        catch (error) {
            assert(error.message.includes('\"text\":\"hi User1\"'), `assertion should have failed.`);
        }
    });

    it('AssertReply_Exact', async () => {
        await testRunner.runTestScript('TestScriptTests_AssertReply_Exact');
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

    it('UserTyping', async () => {
        await testRunner.runTestScript('TestScriptTests_UserTyping');
    });
});
