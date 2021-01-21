const assert = require('assert');
const path = require('path');
const { AdaptiveTestComponentRegistration, ActionPolicyType, ActionPolicyValidator, ActionPolicy } = require('../lib');
const { ComponentRegistration } = require('botbuilder-core');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const {
    AdaptiveComponentRegistration,
    BreakLoop,
    CancelAllDialogs,
    OnEndOfConversationActivity,
} = require('botbuilder-dialogs-adaptive');

describe('ActionPolicyTests', () => {
    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/ActionPolicyTests'),
        true,
        false
    );

    const validator = new ActionPolicyValidator();

    it('LastAction_BreakLoop', () => {
        assert.throws(() => validatePolicies('LastAction_BreakLoop_Invalid'), {
            name: 'ActionPolicyException',
            policy: new ActionPolicy(BreakLoop.$kind, ActionPolicyType.LastAction),
        });
    });

    function validatePolicies(testName) {
        const script = resourceExplorer.loadType(`${testName}.test.dialog`);
        validator.validatePolicies(script.dialog);
    }

    it('LastAction_CancelAllDialogs', () => {
        assert.throws(() => validatePolicies('LastAction_CancelAllDialogs_Invalid'), {
            name: 'ActionPolicyException',
            policy: new ActionPolicy(CancelAllDialogs.$kind, ActionPolicyType.LastAction),
        });
    });

    it('OnEndOfConversationActivity', () => {
        validatePolicies('OnEndOfConversationActivity_Valid');
    });

    it('TriggerNotInteractive_OnEndOfConversationActivity', () => {
        assert.throws(() => validatePolicies('TriggerNotInteractive_OnEndOfConversationActivity_Invalid'), {
            name: 'ActionPolicyException',
            policy: new ActionPolicy(OnEndOfConversationActivity.$kind, ActionPolicyType.TriggerNotInteractive),
        });
    });
});
