/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import * as path from 'path';
import { TestRunner } from './testing';

describe('AdaptiveDialogTests', function() {
    this.timeout(10000);
    const testRunner = new TestRunner(path.join(__dirname,  '../resources/AdaptiveDialogTests'));

    it('ActivityAndIntentEvents', async () => {
        await testRunner.runTestScript('AdaptiveDialog_ActivityAndIntentEvents');
    });

    it('ActivityEvents', async () => {
        await testRunner.runTestScript('AdaptiveDialog_ActivityEvents');
    });

    it('AdaptiveCardSubmit', async () => {
        await testRunner.runTestScript('AdaptiveDialog_AdaptiveCardSubmit');
    });

    it('AllowInterruption', async () => {
        await testRunner.runTestScript('AdaptiveDialog_AllowInterruption');
    });

    it('AllowInterruptionAlwaysWithFailedValidation', async () => {
        await testRunner.runTestScript('AdaptiveDialog_AllowInterruptionAlwaysWithFailedValidation');
    });

    it('AllowInterruptionNever', async () => {
        await testRunner.runTestScript('AdaptiveDialog_AllowInterruptionNever');
    });

    it('AllowInterruptionNeverWithInvalidInput', async () => {
        await testRunner.runTestScript('AdaptiveDialog_AllowInterruptionNeverWithInvalidInput');
    });

    it('AllowInterruptionNeverWithMaxCount', async () => {
        await testRunner.runTestScript('AdaptiveDialog_AllowInterruptionNeverWithMaxCount');
    });

    it('AllowInterruptionNeverWithUnrecognizedInput', async () => {
        await testRunner.runTestScript('AdaptiveDialog_AllowInterruptionNeverWithUnrecognizedInput');
    });

    it('BeginDialog', async () => {
        await testRunner.runTestScript('AdaptiveDialog_BeginDialog');
    });

    it('BindingCaptureValueWithinSameAdaptive', async () => {
        await testRunner.runTestScript('AdaptiveDialog_BindingCaptureValueWithinSameAdaptive');
    });

    it('BindingOptionsAcrossAdaptiveDialogs', async () => {
        await testRunner.runTestScript('AdaptiveDialog_BindingOptionsAcrossAdaptiveDialogs');
    });

    it('BindingReferValueInLaterAction', async () => {
        await testRunner.runTestScript('AdaptiveDialog_BindingReferValueInLaterAction');
    });

    it('BindingReferValueInNestedAction', async () => {
        await testRunner.runTestScript('AdaptiveDialog_BindingReferValueInNestedAction');
    });

    it('ConditionallyAllowInterruptions', async () => {
        await testRunner.runTestScript('AdaptiveDialog_ConditionallyAllowInterruptions');
    });

    it('DoActions', async () => {
        await testRunner.runTestScript('AdaptiveDialog_DoActions');
    });

    it('EditArray', async () => {
        await testRunner.runTestScript('AdaptiveDialog_EditArray');
    });

    it('EmitEventActivityReceived', async () => {
        await testRunner.runTestScript('AdaptiveDialog_EmitEventActivityReceived');
    });

    it('EmitEventActivityReceived', async () => {
        await testRunner.runTestScript('AdaptiveDialog_EmitEventActivityReceived');
    });

    it('EndTurn', async () => {
        await testRunner.runTestScript('AdaptiveDialog_EndTurn');
    });

    it('IfProperty', async () => {
        await testRunner.runTestScript('AdaptiveDialog_IfProperty');
    });

    it('NestedInlineSequences', async () => {
        await testRunner.runTestScript('AdaptiveDialog_NestedInlineSequences');
    });

    it('NestedMemoryAccess', async () => {
        await testRunner.runTestScript('AdaptiveDialog_NestedMemoryAccess');
    });

    it('NestedRecognizers', async () => {
        await testRunner.runTestScript('AdaptiveDialog_NestedRecognizers');
    });

    it('PropertySetInInterruption', async () => {
        await testRunner.runTestScript('AdaptiveDialog_PropertySetInInterruption');
    });

    it('ReplacePlan', async () => {
        await testRunner.runTestScript('AdaptiveDialog_ReplacePlan');
    });

    it('ReProcessInputProperty', async () => {
        await testRunner.runTestScript('AdaptiveDialog_ReProcessInputProperty');
    });

    it('ReProcessInputPropertyValidOnlyOnce', async () => {
        await testRunner.runTestScript('AdaptiveDialog_ReProcessInputPropertyValidOnlyOnce');
    });

    it('StringLiteralInExpression', async () => {
        await testRunner.runTestScript('AdaptiveDialog_StringLiteralInExpression');
    });

    it('TextInput', async () => {
        await testRunner.runTestScript('AdaptiveDialog_TextInput');
    });

    it('TextInputDefaultValueResponse', async () => {
        await testRunner.runTestScript('AdaptiveDialog_TextInputDefaultValueResponse');
    });

    it('TextInputNoMaxTurnCount', async () => {
        await testRunner.runTestScript('AdaptiveDialog_TextInputNoMaxTurnCount');
    });

    it('TopLevelFallback', async () => {
        await testRunner.runTestScript('AdaptiveDialog_TopLevelFallback');
    });

    it('TopLevelFallbackMultipleActivities', async () => {
        await testRunner.runTestScript('AdaptiveDialog_TopLevelFallbackMultipleActivities');
    });

    it('TestBindingTwoWayAcrossAdaptiveDialogs', async () => {
        await testRunner.runTestScript('TestBindingTwoWayAcrossAdaptiveDialogs');
    });

    it('TestBindingTwoWayAcrossAdaptiveDialogsDefaultResultProperty', async () => {
        await testRunner.runTestScript('TestBindingTwoWayAcrossAdaptiveDialogsDefaultResultProperty');
    });

    it('TestForeachWithPrompt', async () => {
        await testRunner.runTestScript('TestForeachWithPrompt');
    });
});