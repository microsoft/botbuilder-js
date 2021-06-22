const { TestUtils } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('AdaptiveDialogTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('AdaptiveDialogTests');
    });

    it('ActivityAndIntentEvents', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ActivityAndIntentEvents');
    });

    it('ActivityEvents', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ActivityEvents');
    });

    it('AdaptiveCardSubmit', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AdaptiveCardSubmit');
    });

    it('AllowInterruption', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruption');
    });

    it('AllowInterruptionAlwaysWithFailedValidation', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruptionAlwaysWithFailedValidation');
    });

    it('AllowInterruptionNever', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruptionNever');
    });

    it('AllowInterruptionNeverWithInvalidInput', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruptionNeverWithInvalidInput');
    });

    it('AllowInterruptionNeverWithMaxCount', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruptionNeverWithMaxCount');
    });

    it('AllowInterruptionNeverWithUnrecognizedInput', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruptionNeverWithUnrecognizedInput');
    });

    it('AllowInterruptionWithMaxCount', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruptionWithMaxCount');
    });

    it('BeginDialog', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_BeginDialog');
    });

    it('BindingCaptureValueWithinSameAdaptive', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_BindingCaptureValueWithinSameAdaptive');
    });

    it('BindingOptionsAcrossAdaptiveDialogs', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_BindingOptionsAcrossAdaptiveDialogs');
    });

    it('BindingReferValueInLaterAction', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_BindingReferValueInLaterAction');
    });

    it('BindingReferValueInNestedAction', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_BindingReferValueInNestedAction');
    });

    it('ConditionallyAllowInterruptions', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ConditionallyAllowInterruptions');
    });

    it('DoActions', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_DoActions');
    });

    it('EditArray', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_EditArray');
    });

    it('EmitEventActivityReceived', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_EmitEventActivityReceived');
    });

    it('EndTurn', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_EndTurn');
    });

    it('IfProperty', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_IfProperty');
    });

    it('NestedInlineSequences', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_NestedInlineSequences');
    });

    it('NestedMemoryAccess', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_NestedMemoryAccess');
    });

    it('NestedRecognizers', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_NestedRecognizers');
    });

    it('PropertySetInInterruption', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ParentBotInterruption');
    });

    it('PropertySetInInterruption', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_PropertySetInInterruption');
    });

    it('ReplacePlan', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ReplacePlan');
    });

    it('ReProcessInputProperty', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ReProcessInputProperty');
    });

    it('ReProcessInputPropertyValidOnlyOnce', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ReProcessInputPropertyValidOnlyOnce');
    });

    it('StringLiteralInExpression', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_StringLiteralInExpression');
    });

    it('TextInput', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_TextInput');
    });

    it('TextInputDefaultValueResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_TextInputDefaultValueResponse');
    });

    it('TextInputNoMaxTurnCount', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_TextInputNoMaxTurnCount');
    });

    it('TopLevelFallback', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_TopLevelFallback');
    });

    it('TopLevelFallbackMultipleActivities', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_TopLevelFallbackMultipleActivities');
    });

    it('TestBindingTwoWayAcrossAdaptiveDialogs', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestBindingTwoWayAcrossAdaptiveDialogs');
    });

    it('TestBindingTwoWayAcrossAdaptiveDialogsDefaultResultProperty', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestBindingTwoWayAcrossAdaptiveDialogsDefaultResultProperty');
    });

    it('TestForeachWithPrompt', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'TestForeachWithPrompt');
    });
});
