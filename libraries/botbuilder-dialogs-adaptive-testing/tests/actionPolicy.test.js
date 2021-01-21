const assert = require('assert');
const path = require('path');
const {
    ComponentRegistration,
} = require('botbuilder-core');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils, TestScript, ActionPolicyType, ActionPolicyValidator } = require('../lib');
const {
    AdaptiveComponentRegistration,
    BreakLoop,
    CancelAllDialogs,
    OnEndOfConversationActivity
} = require('botbuilder-dialogs-adaptive');

describe('ActionPolicyTests', function () {
    this.timeout(10000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/ActionPolicyTests'),
        true,
        false
    );

    const validator = new ActionPolicyValidator();

    it('LastAction_BreakLoop', async () => {
        let threwError = false;
        try {
            validatePolicies('LastAction_BreakLoop_Invalid')
        } catch (error) {
            threwError = true;
            assert(BreakLoop.$kind === error.policy.Kind, `kind of error does not match expected kind.`);
            assert(ActionPolicyType.LastAction === error.policy.ActionPolicyType, `policy type of error does not match.`);
        }

        assert(threwError, 'LastAction_BreakLoop test failed');
    });

    function validatePolicies(testName) {
        var script = resourceExplorer.loadType(`${testName}.test.dialog`);
        validator.validatePolicies(script.dialog);
    }

    it('LastAction_CancelAllDialogs', async () => {
        let threwError = false;
        try {
            validatePolicies('LastAction_CancelAllDialogs_Invalid')
        } catch (error) {
            threwError = true;
            assert(CancelAllDialogs.$kind === error.policy.Kind, `kind of error does not match expected kind.`);
            assert(ActionPolicyType.LastAction === error.policy.ActionPolicyType, `policy type of error does not match.`);
        }

        assert(threwError, 'LastAction_CancelAllDialogs test failed');
    });

    it('OnEndOfConversationActivity', async () => {
        validatePolicies('OnEndOfConversationActivity_Valid')
    });

    it('TriggerNotInteractive_OnEndOfConversationActivity', async () => {
        let threwError = false;
        try {
            validatePolicies('TriggerNotInteractive_OnEndOfConversationActivity_Invalid')
        } catch (error) {
            threwError = true;
            assert(OnEndOfConversationActivity.$kind === error.policy.Kind, `kind of error does not match expected kind.`);
            assert(ActionPolicyType.TriggerNotInteractive === error.policy.ActionPolicyType, `policy type of error does not match.`);
        }

        assert(threwError, 'TriggerNotInteractive_OnEndOfConversationActivity_Invalid test failed');
    });
});
