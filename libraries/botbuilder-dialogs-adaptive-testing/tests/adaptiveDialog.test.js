const { TestUtils } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('AdaptiveDialogTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('AdaptiveDialogTests');
    });

    it('ActivityAndIntentEvents', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ActivityAndIntentEvents');
    });

    it('ActivityEvents', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ActivityEvents');
    });

    it('AdaptiveCardSubmit', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AdaptiveCardSubmit');
    });

    it('AllowInterruption', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruption');
    });

    it('AllowInterruptionAlwaysWithFailedValidation', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruptionAlwaysWithFailedValidation');
    });

    it('AllowInterruptionNever', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruptionNever');
    });

    it('AllowInterruptionNeverWithInvalidInput', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruptionNeverWithInvalidInput');
    });

    it('AllowInterruptionNeverWithMaxCount', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruptionNeverWithMaxCount');
    });

    it('AllowInterruptionNeverWithUnrecognizedInput', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_AllowInterruptionNeverWithUnrecognizedInput');
    });

    it('BeginDialog', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_BeginDialog');
    });

    it('BindingCaptureValueWithinSameAdaptive', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_BindingCaptureValueWithinSameAdaptive');
    });

    it('BindingOptionsAcrossAdaptiveDialogs', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_BindingOptionsAcrossAdaptiveDialogs');
    });

    it('BindingReferValueInLaterAction', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_BindingReferValueInLaterAction');
    });

    it('BindingReferValueInNestedAction', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_BindingReferValueInNestedAction');
    });

    it('ConditionallyAllowInterruptions', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ConditionallyAllowInterruptions');
    });

    it('DoActions', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_DoActions');
    });

    it('EditArray', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_EditArray');
    });

    it('EmitEventActivityReceived', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_EmitEventActivityReceived');
    });

    it('EndTurn', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_EndTurn');
    });

    it('IfProperty', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_IfProperty');
    });

    it('NestedInlineSequences', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_NestedInlineSequences');
    });

    it('NestedMemoryAccess', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_NestedMemoryAccess');
    });

    it('NestedRecognizers', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_NestedRecognizers');
    });

    it('PropertySetInInterruption', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_PropertySetInInterruption');
    });

    it('ReplacePlan', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ReplacePlan');
    });

    it('ReProcessInputProperty', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ReProcessInputProperty');
    });

    it('ReProcessInputPropertyValidOnlyOnce', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_ReProcessInputPropertyValidOnlyOnce');
    });

    it('StringLiteralInExpression', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_StringLiteralInExpression');
    });

    it('TextInput', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_TextInput');
    });

    it('TextInputDefaultValueResponse', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_TextInputDefaultValueResponse');
    });

    it('TextInputNoMaxTurnCount', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_TextInputNoMaxTurnCount');
    });

    it('TopLevelFallback', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_TopLevelFallback');
    });

    it('TopLevelFallbackMultipleActivities', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'AdaptiveDialog_TopLevelFallbackMultipleActivities');
    });

    it('TestBindingTwoWayAcrossAdaptiveDialogs', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestBindingTwoWayAcrossAdaptiveDialogs');
    });

    it('TestBindingTwoWayAcrossAdaptiveDialogsDefaultResultProperty', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestBindingTwoWayAcrossAdaptiveDialogsDefaultResultProperty');
    });

    it('TestForeachWithPrompt', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'TestForeachWithPrompt');
    });
});
