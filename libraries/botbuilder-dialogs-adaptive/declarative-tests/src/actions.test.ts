/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import { TestRunner } from 'botbuilder-dialogs-adaptive';

describe('Actions', ()  => {
    const testRunner = new TestRunner('resources/actionsTests');

    it('BeginDialog', async () => {
        await testRunner.runTestScript('BeginDialog');
    });

    it('BeginDialogWithActivity', async () => {
        await testRunner.runTestScript('BeginDialogWithActivity');
    });

    it('ChoiceInput', async () => {
        await testRunner.runTestScript('ChoiceInput');
    });

    it('ChoiceInputWithLocale', async () => {
        await testRunner.runTestScript('ChoiceInputWithLocale');
    });

    it('ChoicesInMemory', async () => {
        await testRunner.runTestScript('ChoicesInMemory');
    });

    it('ChoiceStringInMemory', async () => {
        await testRunner.runTestScript('ChoiceStringInMemory');
    });

    it('ConfirmInput', async () => {
        await testRunner.runTestScript('ConfirmInput');
    });

    it('DatetimeInput', async () => {
        await testRunner.runTestScript('DatetimeInput');
    });

    it('DeleteProperties', async () => {
        await testRunner.runTestScript('DeleteProperties');
    });

    it('DeleteProperty', async () => {
        await testRunner.runTestScript('DeleteProperty');
    });

    it('DoActions', async () => {
        await testRunner.runTestScript('DoActions');
    });

    it('EditActionReplaceSequence', async () => {
        await testRunner.runTestScript('EditActionReplaceSequence');
    });

    it('EmitEvent', async () => {
        await testRunner.runTestScript('EmitEvent');
    });

    it('EndDialog', async () => {
        await testRunner.runTestScript('EndDialog');
    });

    it('Foreach', async () => {
        await testRunner.runTestScript('Foreach');
    });

    it('ForeachPage_Empty', async () => {
        await testRunner.runTestScript('ForeachPage_Empty');
    });

    // Missing LG support
    /*
    it('ForeachPage_Partial', async () => {
        await testRunner.runTestScript('ForeachPage_Partial');
    });
    */

    // Missing LG support
    /*
    it('ForeachPage', async () => {
        await testRunner.runTestScript('ForeachPage');
    });
    */

    it('GotoAction', async () => {
        await testRunner.runTestScript('GotoAction');
    });

    it('IfCondition', async () => {
        await testRunner.runTestScript('IfCondition');
    });

    it('InputDialog_ActivityProcessed', async () => {
        await testRunner.runTestScript('InputDialog_ActivityProcessed');
    });

    it('NumerInput', async () => {
        await testRunner.runTestScript('NumberInput');
    });

    it('NumerInputWithDefaultValue', async () => {
        await testRunner.runTestScript('NumberInputWithDefaultValue');
    });

    // Missing EntityRecognizer support
    /*
    it('NumerInputWithValueExpression', async () => {
        await testRunner.runTestScript('NumberInputWithValueExpression');
    });
    */

    it('RepeatDialog', async () => {
        await testRunner.runTestScript('RepeatDialog');
    });

    it('ReplaceDialog', async () => {
        await testRunner.runTestScript('ReplaceDialog');
    });

    it('SetProperties', async () => {
        await testRunner.runTestScript('SetProperties');
    });

    it('SetProperty', async () => {
        await testRunner.runTestScript('SetProperty');
    });

    it('Switch_Bool', async () => {
        await testRunner.runTestScript('Switch_Bool');
    });

    it('Switch_Default', async () => {
        await testRunner.runTestScript('Switch_Default');
    });

    it('Switch_Number', async () => {
        await testRunner.runTestScript('Switch_Number');
    });

    it('Switch', async () => {
        await testRunner.runTestScript('Switch');
    });

    it('TextInput', async () => {
        await testRunner.runTestScript('TextInput');
    });

    it('TextInputWithInvalidPrompt', async () => {
        await testRunner.runTestScript('TextInputWithInvalidPrompt');
    });

    it('TextInputWithValueExpression', async () => {
        await testRunner.runTestScript('TextInputWithValueExpression');
    });

    it('TraceActivity', async () => {
        await testRunner.runTestScript('TraceActivity');
    });

    it('WaitForInput', async () => {
        await testRunner.runTestScript('WaitForInput');
    });
});
