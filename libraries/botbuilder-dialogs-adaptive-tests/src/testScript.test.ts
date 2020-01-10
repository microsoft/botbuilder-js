/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import { TestRunner } from './testing';

describe('TestScript', () => {
    const testRunner = new TestRunner('resources/testScriptTests');

    it('AssertReply_Assertions', async () => {
        await testRunner.runTestScript('TestScriptTests_AssertReply_Assertions');
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
