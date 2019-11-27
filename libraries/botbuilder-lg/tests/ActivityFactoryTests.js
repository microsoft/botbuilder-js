/*
const { TemplateEngine, ActivityFactory } = require('../');
const assert = require('assert');

function getTemplateEngine(){
    const filePath =  `${ __dirname }/testData/Examples/NormalStructuredLG.lg`;
    return new TemplateEngine().addFile(filePath);
}

function getActivity(templateName, data){
    const engine = getTemplateEngine();
    const lgResult = engine.evaluateTemplate(templateName, data);
    return ActivityFactory.createActivity(lgResult);
}


describe('ActivityFactoryTest', function() {
    it('inlineActivityFactory', function() {
        let result = ActivityFactory.createActivity('text');
        assert(result.text === 'text');
        assert(result.speak === 'text');
    });

    it('NotSupportStructuredType', function() {
        assert.throws(() => {getActivity('notSupport', undefined); }, Error);
    });

    it('HerocardWithCardAction', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent'
        };
        let result = getActivity('HerocardWithCardAction', data);
        assertCardActionActivity(result);
    });

    it('adaptivecardActivity', function() {
        let data = {
            adaptiveCardTitle: 'test'
        };
        let result = getActivity('adaptivecardActivity', data);
        assertAdaptiveCardActivity(result);
    });

    it('externalAdaptiveCardActivity', function() {
        let data = {
            adaptiveCardTitle: 'test'
        };
        let result = getActivity('externalAdaptiveCardActivity', data);
        assertAdaptiveCardActivity(result);
    });

    it('multiExternalAdaptiveCardActivity', function() {
        let data = {titles: ['test0', 'test1', 'test2']};
        let result = getActivity('multiExternalAdaptiveCardActivity', data);
        assertMultiAdaptiveCardActivity(result);
    });

    it('adaptivecardActivityWithAttachmentStructure', function() {
        let data = {
            adaptiveCardTitle: 'test'
        };
        let result = getActivity('adaptivecardActivityWithAttachmentStructure', data);
        assertAdaptiveCardActivity(result);
    });

    it('externalHeroCardActivity', function() {
        let data = {
            type: 'imBack',
            title: 'taptitle',
            value: 'tapvalue'
        };
        let result = getActivity('externalHeroCardActivity', data);
        assertActivityWithHeroCardAttachment(result);
    });

    it('eventActivity', function() {
        let data = {
            text: 'textContent'
        };
        let result = getActivity('eventActivity', data);
        assertEventActivity(result);
    });

    it('handoffActivity', function() {
        let data = {
            text: 'textContent'
        };
        let result = getActivity('handoffActivity', data);
        assertHandoffActivity(result);
    });

    it('activityWithHeroCardAttachment', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent'
        };
        let result = getActivity('activityWithHeroCardAttachment', data);
        assertActivityWithHeroCardAttachment(result);
    });

    it('herocardAttachment', function() {
        let data = {
            type: 'imBack',
            title: 'taptitle',
            value: 'tapvalue'
        };
        let result = getActivity('herocardAttachment', data);
        assertActivityWithHeroCardAttachment(result);
    });

    it('activityWithMultiAttachments', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent'
        };
        let result = getActivity('activityWithMultiAttachments', data);
        assertActivityWithMultiAttachments(result);
    });

    it('activityWithSuggestionActions', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent'
        };
        let result = getActivity('activityWithSuggestionActions', data);
        assertActivityWithSuggestionActions(result);
    });

    it('messageActivityAll', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent'
        };
        let result = getActivity('messageActivityAll', data);
        assertMessageActivityAll(result);
    });

    it('activityWithMultiStructuredSuggestionActions', function() {
        let data = {
            text: 'textContent'
        };
        let result = getActivity('activityWithMultiStructuredSuggestionActions', data);
        assertActivityWithMultiStructuredSuggestionActions(result);
    });

    it('activityWithMultiStringSuggestionActions', function() {
        let data = {
            text: 'textContent'
        };
        let result = getActivity('activityWithMultiStringSuggestionActions', data);
        assertActivityWithMultiStringSuggestionActions(result);
    });

    it('HeroCardTemplate', function() {
        let data = {
            type: 'herocard'
        };
        let result = getActivity('HeroCardTemplate', data);
        assertHeroCardActivity(result);
    });

    it('ThumbnailCardTemplate', function() {
        let data = {
            type: 'thumbnailcard'
        };
        let result = getActivity('ThumbnailCardTemplate', data);
        assertThumbnailCardActivity(result);
    });

    it('AudioCardTemplate', function() {
        let data = {
            type: 'audiocard'
        };
        let result = getActivity('AudioCardTemplate', data);
        assertAudioCardActivity(result);
    });

    it('VideoCardTemplate', function() {
        let data = {
            type: 'videocard'
        };
        let result = getActivity('VideoCardTemplate', data);
        assertVideoCardActivity(result);
    });

    it('SigninCardTemplate', function() {
        let data = {
            signinlabel: 'Sign in',
            url: 'https://login.microsoftonline.com/'
        };
        let result = getActivity('SigninCardTemplate', data);
        assertSigninCardActivity(result);
    });

    it('OAuthCardTemplate', function() {
        let data = {
            connectionName: 'MyConnection',
            signinlabel: 'Sign in',
            url: 'https://login.microsoftonline.com/'
        };
        let result = getActivity('OAuthCardTemplate', data);
        assertOAuthCardActivity(result);
    });

    it('ReceiptCardTemplate', function() {
        let data = {
            type: 'ReceiptCard',
            receiptItems: [
                {
                    title: 'Data Transfer',
                    price: '$ 38.45',
                    quantity: '368',
                    image: {
                        url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png'
                    }
                },
                {
                    title: 'App Service',
                    price: '$ 45.00',
                    quantity: '720',
                    image: {
                        url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png'
                    }
                }
            ]
        };
        let result = getActivity('ReceiptCardTemplate', data);
        assertReceiptCardActivity(result);
    });

    it('SuggestedActionsReference', function() {
        let data = {
            text: 'textContent'
        };
        let result = getActivity('SuggestedActionsReference', data);
        assertSuggestedActionsReferenceActivity(result);
    });
});

function assertSuggestedActionsReferenceActivity(activity) {
    assert.strictEqual(activity.type, 'message');
    assert.strictEqual(activity.text, 'textContent');
    assert.strictEqual(activity.suggestedActions.actions.length, 5);
    assert.strictEqual(activity.suggestedActions.actions[0].value, 'Add todo');
    assert.strictEqual(activity.suggestedActions.actions[1].value, 'View Todo');
    assert.strictEqual(activity.suggestedActions.actions[2].value, 'Remove Todo');
    assert.strictEqual(activity.suggestedActions.actions[3].value, 'Cancel');
    assert.strictEqual(activity.suggestedActions.actions[4].value, 'Help');
}

function assertOAuthCardActivity(activity) {
    assert.strictEqual(activity.type, 'message');
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.oauth');
    const card = activity.attachments[0].content;
    assert(card !== undefined);
    assert.strictEqual(card.text, 'This is some text describing the card, it\'s cool because it\'s cool');
    assert.strictEqual(card.connectionName, 'MyConnection');
    assert.strictEqual(card.buttons.length, 1);
    assert.strictEqual(card.buttons[0].title, 'Sign in');
    assert.strictEqual(card.buttons[0].type, 'signin');
    assert.strictEqual(card.buttons[0].value, 'https://login.microsoftonline.com/');
}

function assertSigninCardActivity(activity) {
    assert.strictEqual(activity.type, 'message');
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.signin');
    const card = activity.attachments[0].content;
    assert(card !== undefined);
    assert.strictEqual(card.buttons.length, 1);
    assert.strictEqual(card.buttons[0].title, 'Sign in');
    assert.strictEqual(card.buttons[0].type, 'signin');
    assert.strictEqual(card.buttons[0].value, 'https://login.microsoftonline.com/');
}

function assertVideoCardActivity(activity) {
    assert.strictEqual(activity.type, 'message');
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.video');
    const card = activity.attachments[0].content;
    assert(card !== undefined);
    assert.strictEqual(card.title, 'Cheese gromit!');
    assert.strictEqual(card.subtitle, 'videocard');
    assert.strictEqual(card.text, 'This is some text describing the card, it\'s cool because it\'s cool');
    assert.strictEqual(card.image.url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.media[0].url, 'https://youtu.be/530FEFogfBQ');
    assert.strictEqual(card.shareable, false);
    assert.strictEqual(card.autoloop, true);
    assert.strictEqual(card.autostart, true);
    assert.strictEqual(card.aspect, '16:9');
    assert.strictEqual(card.buttons.length, 3);

    for (let i = 0; i < card.buttons.length; i++) {
        assert.strictEqual(card.buttons[i].title, `Option ${ i + 1 }`);
    }
}

function assertAudioCardActivity(activity) {
    assert.strictEqual(activity.type, 'message');
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.audio');
    const card = activity.attachments[0].content;
    assert(card !== undefined);
    assert.strictEqual(card.title, 'Cheese gromit!');
    assert.strictEqual(card.subtitle, 'audiocard');
    assert.strictEqual(card.text, 'This is some text describing the card, it\'s cool because it\'s cool');
    assert.strictEqual(card.image.url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.media[0].url, 'https://contoso.com/media/AllegrofromDuetinCMajor.mp3');
    assert.strictEqual(card.shareable, false);
    assert.strictEqual(card.autoloop, true);
    assert.strictEqual(card.autostart, true);
    assert.strictEqual(card.aspect, '16:9');
    assert.strictEqual(card.buttons.length, 3);

    for (let i = 0; i < card.buttons.length; i++) {
        assert.strictEqual(card.buttons[i].title, `Option ${ i + 1 }`);
    }
}


function assertThumbnailCardActivity(activity) {
    assert.strictEqual(activity.type, 'message');
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.thumbnail');
    const card = activity.attachments[0].content;
    assert(card !== undefined);
    assert.strictEqual(card.title, 'Cheese gromit!');
    assert.strictEqual(card.subtitle, 'thumbnailcard');
    assert.strictEqual(card.text, 'This is some text describing the card, it\'s cool because it\'s cool');
    assert.strictEqual(card.images[0].url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.images[1].url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.buttons.length, 3);

    for (let i = 0; i < card.buttons.length; i++) {
        assert.strictEqual(card.buttons[i].title, `Option ${ i + 1 }`);
    }
}

function assertHeroCardActivity(activity) {
    assert.strictEqual(activity.type, 'message');
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.hero');
    const card = activity.attachments[0].content;
    assert(card !== undefined);
    assert.strictEqual(card.title, 'Cheese gromit!');
    assert.strictEqual(card.subtitle, 'herocard');
    assert.strictEqual(card.text, 'This is some text describing the card, it\'s cool because it\'s cool');
    assert.strictEqual(card.images[0].url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.images[1].url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.buttons.length, 3);

    for (let i = 0; i < card.buttons.length; i++) {
        assert.strictEqual(card.buttons[i].title, `Option ${ i + 1 }`);
    }
}

function assertActivityWithMultiStringSuggestionActions(activity) {
    assert.strictEqual(activity.type, 'message');
    assert.strictEqual(activity.text, 'textContent');
    assert.strictEqual(activity.suggestedActions.actions.length, 3);
    assert.strictEqual(activity.suggestedActions.actions[0].title, 'first suggestion');
    assert.strictEqual(activity.suggestedActions.actions[0].value, 'first suggestion');
    assert.strictEqual(activity.suggestedActions.actions[1].title, 'second suggestion');
    assert.strictEqual(activity.suggestedActions.actions[1].value, 'second suggestion');
    assert.strictEqual(activity.suggestedActions.actions[2].title, 'third suggestion');
    assert.strictEqual(activity.suggestedActions.actions[2].value, 'third suggestion');
}

function assertActivityWithMultiStructuredSuggestionActions(activity) {
    assert.strictEqual(activity.type, 'message');
    assert.strictEqual(activity.text, 'textContent');
    assert.strictEqual(activity.suggestedActions.actions.length, 3);
    assert.strictEqual(activity.suggestedActions.actions[0].title, 'first suggestion');
    assert.strictEqual(activity.suggestedActions.actions[0].value, 'first suggestion');
    assert.strictEqual(activity.suggestedActions.actions[0].text, 'first suggestion');
    assert.strictEqual(activity.suggestedActions.actions[1].title, 'second suggestion');
    assert.strictEqual(activity.suggestedActions.actions[1].value, 'second suggestion');
    assert.strictEqual(activity.suggestedActions.actions[1].text, 'second suggestion');
    assert.strictEqual(activity.suggestedActions.actions[2].title, 'third suggestion');
    assert.strictEqual(activity.suggestedActions.actions[2].value, 'third suggestion');
    assert.strictEqual(activity.suggestedActions.actions[2].text, 'third suggestion');
}

function assertMessageActivityAll(activity) {
    assert.strictEqual(activity.type, 'message');
    assert.strictEqual(activity.text, 'textContent');
    assert.strictEqual(activity.speak, 'textContent');
    assert.strictEqual(activity.inputHint, 'accepting');
    assert.strictEqual(activity.attachmentLayout, 'list');

    const semanticAction = activity.semanticAction;
    assert.strictEqual(semanticAction.id, 'actionId');
    assert.strictEqual(Object.keys(semanticAction.entities).length, 1);
    assert.strictEqual('key1' in semanticAction.entities, true);
    assert.strictEqual(semanticAction.entities['key1'].type, 'entityType');

    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.hero');
    const card = activity.attachments[0].content;
    assert(card !== undefined);

    const tap = card.tap;
    assert.strictEqual(tap.title, 'taptitle');
    assert.strictEqual(tap.value, 'tapvalue');
    assert.strictEqual(tap.type, 'imBack');

    assert.strictEqual(card.text, 'textContent');
    assert.strictEqual(card.buttons.length, 1, 'should have one button');
    const button = card.buttons[0];
    assert.strictEqual(button.type, 'imBack');
    assert.strictEqual(button.title, 'titleContent');
    assert.strictEqual(button.value, 'textContent');
    assert.strictEqual(activity.suggestedActions.actions.length, 2);
    assert.strictEqual(activity.suggestedActions.actions[0].title, 'firstItem');
    assert.strictEqual(activity.suggestedActions.actions[0].value, 'firstItem');
    assert.strictEqual(activity.suggestedActions.actions[1].title, 'titleContent');
    assert.strictEqual(activity.suggestedActions.actions[1].value, 'textContent');
}

function assertActivityWithSuggestionActions(activity) {
    assert.strictEqual(activity.type, 'message');
    assert.strictEqual(activity.text, 'textContent');
    assert.strictEqual(activity.suggestedActions.actions.length, 2);
    assert.strictEqual(activity.suggestedActions.actions[0].title, 'firstItem');
    assert.strictEqual(activity.suggestedActions.actions[0].value, 'firstItem');
    assert.strictEqual(activity.suggestedActions.actions[1].title, 'titleContent');
    assert.strictEqual(activity.suggestedActions.actions[1].value, 'textContent');
}

function assertActivityWithMultiAttachments(activity) {
    assert.strictEqual(activity.type, 'message');
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 2);
    assert.strictEqual(activity.attachments[1].contentType, 'application/vnd.microsoft.card.thumbnail');
    const card = activity.attachments[1].content;
    assert(card !== undefined);
    assert.strictEqual(card.title, 'Cheese gromit!');
    assert.strictEqual(card.subtitle, 'type');
    assert.strictEqual(card.text, 'This is some text describing the card, it\'s cool because it\'s cool');
    assert.strictEqual(card.images[0].url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.images[1].url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.buttons.length, 3);

    for (let i = 0; i < card.buttons.length; i++) {
        assert.strictEqual(card.buttons[i].title, `Option ${ i + 1 }`);
    }
}

function assertActivityWithHeroCardAttachment(activity) {
    assert.strictEqual(activity.type, 'message');
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.hero');
    const card = activity.attachments[0].content;
    assert(card !== undefined);

    const tap = card.tap;
    assert.strictEqual(tap.title, 'taptitle');
    assert.strictEqual(tap.value, 'tapvalue');
    assert.strictEqual(tap.type, 'imBack');

    assert.strictEqual(card.title, 'titleContent');
    assert.strictEqual(card.text, 'textContent');
    assert.strictEqual(card.buttons.length, 1, 'should have one button');
    const button = card.buttons[0];
    assert.strictEqual(button.type, 'imBack');
    assert.strictEqual(button.title, 'titleContent');
    assert.strictEqual(button.value, 'textContent');
}

function assertHandoffActivity(activity) {
    assert.strictEqual(activity.type, 'handoff');
    assert.strictEqual(activity.name, 'textContent');
    assert.strictEqual(activity.value, 'textContent');
}

function assertCardActionActivity(activity) {
    assert.strictEqual(activity.type, 'message');
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.hero');
    const card = activity.attachments[0].content;
    assert(card !== undefined);
    assert.strictEqual(card.title, 'titleContent');
    assert.strictEqual(card.text, 'textContent');
    assert.strictEqual(card.buttons.length, 1, 'should have one button');
    const button = card.buttons[0];
    assert.strictEqual(button.type, 'imBack');
    assert.strictEqual(button.title, 'titleContent');
    assert.strictEqual(button.value, 'textContent');
}

function assertAdaptiveCardActivity(activity) {
    assert.strictEqual(activity.type, 'message');
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1, 'should have one attachment');
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.adaptive', 'attachment type should be adaptivecard');
    assert.strictEqual(activity.attachments[0].content.body[0].text, 'test', 'text of first body should have value');
}

function assertMultiAdaptiveCardActivity(activity) {
    assert.strictEqual(activity.type, 'message');
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 3);
    for (let i = 0; i < activity.attachments.length; i++) {
        assert.strictEqual(activity.attachments[i].contentType, `application/vnd.microsoft.card.adaptive`);
        assert.strictEqual(activity.attachments[i].content.body[0].text, `test${ i }`);
    }
}

function assertEventActivity(activity) {
    assert.strictEqual(activity.type, 'event');
    assert.strictEqual(activity.name, 'textContent');
    assert.strictEqual(activity.value, 'textContent');
}

function assertReceiptCardActivity(activity) {
    assert.strictEqual(activity.type, 'message');
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.receipt');
    const card = activity.attachments[0].content;
    assert(card !== undefined);

    assert.strictEqual(card.title, 'John Doe');
    assert.strictEqual(card.tax, '$ 7.50');
    assert.strictEqual(card.total, '$ 90.95');

    const buttons = card.buttons;
    assert.strictEqual(buttons.length, 1);
    const button = buttons[0];
    assert.strictEqual(button.title, 'More information');
    assert.strictEqual(button.type, 'openUrl');
    assert.strictEqual(button.value, 'https://azure.microsoft.com/en-us/pricing/');
    assert.strictEqual(button.image, 'https://account.windowsazure.com/content/6.10.1.38-.8225.160809-1618/aux-pre/images/offer-icon-freetrial.png');

    const facts = card.facts;
    assert.strictEqual(facts.length, 2);
    assert.strictEqual(facts[0].key, 'Order Number');
    assert.strictEqual(facts[0].value, '1234');
    assert.strictEqual(facts[1].key, 'Payment Method');
    assert.strictEqual(facts[1].value, 'VISA 5555-****');

    const items = card.items;
    assert.strictEqual(items.length, 2);
    assert.strictEqual(items[0].title, 'Data Transfer');
    assert.strictEqual(items[0].image.url, 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png');
    assert.strictEqual(items[0].price, '$ 38.45');
    assert.strictEqual(items[0].quantity, '368');
    assert.strictEqual(items[1].title, 'App Service');
    assert.strictEqual(items[1].image.url, 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png');
    assert.strictEqual(items[1].price, '$ 45.00');
    assert.strictEqual(items[1].quantity, '720');

}

*/