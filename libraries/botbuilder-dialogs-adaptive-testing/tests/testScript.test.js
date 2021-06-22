const assert = require('assert');
const path = require('path');
const { LuisAdaptiveRecognizer, QnAMakerBotComponent } = require('botbuilder-ai');
const { MockLuisLoader, MockLuisRecognizer, TestUtils, useMockLuisSettings } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('TestScriptTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('TestScriptTests', QnAMakerBotComponent);
    });

    it('AssertReply_Assertions', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReply_Assertions');
    });

    it('AssertReply_AssertCondition', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertCondition');
    });

    it('AssertReply_Assertions_Failed', async function () {
        await assert.rejects(
            TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReply_Assertions_Failed'),
            (err) => {
                assert(err.message.includes('undefined text.length == 0 {"type":"message","text":"hi User1"'));
                return true;
            }
        );
    });

    it('AssertReply_Exact', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReply_Exact');
    });

    it('AssertReply_ExactInvalid', async function () {
        assert.rejects(async () => {
            await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReply_ExactInvalid');
        });
    });

    it('AssertReply_Invalid', async function () {
        assert.rejects(async () => {
            await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReply_Invalid');
        });
    });

    it('AssertReply_User', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReply_User');
    });

    it('AssertReplyOneOf_Assertions', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReplyOneOf_Assertions');
    });

    it('AssertReplyOneOf_Exact', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReplyOneOf_Exact');
    });

    it('AssertReplyOneOf_User', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReplyOneOf_User');
    });

    it('AssertReplyOneOf', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_AssertReplyOneOf');
    });

    it('CustomEvent', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_CustomEvent');
    });

    it('HttpRequestLuisMock', async function () {
        const resourceDir = path.join(__dirname, 'resources/TestScriptTests/LuisMock');
        const config = useMockLuisSettings(resourceDir);
        resourceExplorer.registerType(
            LuisAdaptiveRecognizer.$kind,
            MockLuisRecognizer,
            new MockLuisLoader(resourceExplorer, config)
        );
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_HttpRequestLuisMock', undefined, config);
    });

    it('HttpRequestMock', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_HttpRequestMock');
    });

    it('HttpRequestQnAMakerRecognizerMock', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_HttpRequestQnAMakerRecognizerMock');
    });

    it('HttpRequestQnAMakerDialogMock', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_HttpRequestQnAMakerDialogMock');
    });

    it('OAuthInputLG', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_OAuthInputLG');
    });

    it('OAuthInputMockProperties', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_OAuthInputMockProperties');
    });

    it('OAuthInputRetries_WithNullMessageText', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_OAuthInputRetries_WithNullMessageText');
    });

    it('PropertyMock', async function () {
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

    it('SettingMock', async function () {
        const configuration = {
            file: 'set settings.file',
            fileoverwrite: 'this is overwritten',
        };
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_SettingMock', undefined, configuration);
    });

    it('UserActivity', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_UserActivity');
    });

    it('UserConversationUpdate', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_UserConversationUpdate');
    });

    it('UserTokenMock', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_UserTokenMock');
    });

    it('UserTyping', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestScriptTests_UserTyping');
    });
});
