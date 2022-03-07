// this test would be migrated to adaptive dialog package

const { Templates } = require('botbuilder-lg');
const { ActivityFactory, ActivityTypes } = require('botbuilder');
const assert = require('assert');

function getTemplates() {
    Templates.enableFromFile = true;
    const filePath = `${__dirname}/lg/NormalStructuredLG.lg`;
    return Templates.parseFile(filePath);
}

const templates = getTemplates();
function getActivity(templateName, data) {
    const lgResult = templates.evaluate(templateName, data);
    return ActivityFactory.fromObject(lgResult);
}

describe('ActivityFactoryTest', function () {
    it('inlineActivityFactory', function () {
        let result = ActivityFactory.fromObject('text');
        assert(result.text === 'text');
        assert(result.speak === 'text');
        assert(result.inputHint === undefined);

        const data = {
            title: 'titleContent',
            text: 'textContent',
        };

        const cardActionLgResult = templates.evaluateText('${HerocardWithCardAction()}', data);
        result = ActivityFactory.fromObject(cardActionLgResult);
        assertCardActionActivity(result);
    });

    it('NotSupportStructuredType', function () {
        const result = getActivity('notSupport', undefined);
        assert.strictEqual(result.attachments, undefined);
        assert.strictEqual(
            result.text.replace(/\r\n/g, '\n').replace(/\n/g, '').replace(/\s+/g, ''),
            '{"lgType":"Acti","key":"value"}'
        );
    });

    it('HerocardWithCardAction', function () {
        const data = {
            title: 'titleContent',
            text: 'textContent',
        };
        const result = getActivity('HerocardWithCardAction', data);
        assertCardActionActivity(result);
    });

    it('adaptivecardActivity', function () {
        const data = {
            adaptiveCardTitle: 'test',
        };
        const result = getActivity('adaptivecardActivity', data);
        assertAdaptiveCardActivity(result);
    });

    it('externalAdaptiveCardActivity', function () {
        const data = {
            adaptiveCardTitle: 'test',
        };
        const result = getActivity('externalAdaptiveCardActivity', data);
        assertAdaptiveCardActivity(result);
    });

    it('multiExternalAdaptiveCardActivity', function () {
        const data = { titles: ['test0', 'test1', 'test2'] };
        const result = getActivity('multiExternalAdaptiveCardActivity', data);
        assertMultiAdaptiveCardActivity(result);
    });

    it('adaptivecardActivityWithAttachmentStructure', function () {
        const data = {
            adaptiveCardTitle: 'test',
        };
        const result = getActivity('adaptivecardActivityWithAttachmentStructure', data);
        assertAdaptiveCardActivity(result);
    });

    it('externalHeroCardActivity', function () {
        const data = {
            type: 'imBack',
            title: 'taptitle',
            value: 'tapvalue',
        };
        const result = getActivity('externalHeroCardActivity', data);
        assertActivityWithHeroCardAttachment(result);
    });

    it('eventActivity', function () {
        const data = {
            text: 'textContent',
        };
        const result = getActivity('eventActivity', data);
        assertEventActivity(result);
    });

    it('customizedActivityType', function () {
        const result = getActivity('customizedActivityType', undefined);
        assertCustomizedActivityType(result);
    });

    it('handoffActivity', function () {
        const data = {
            text: 'textContent',
        };
        const result = getActivity('handoffActivity', data);
        assertHandoffActivity(result);
    });

    it('activityWithHeroCardAttachment', function () {
        const data = {
            title: 'titleContent',
            text: 'textContent',
        };
        const result = getActivity('activityWithHeroCardAttachment', data);
        assertActivityWithHeroCardAttachment(result);
    });

    it('herocardAttachment', function () {
        const data = {
            type: 'imBack',
            title: 'taptitle',
            value: 'tapvalue',
        };
        const result = getActivity('herocardAttachment', data);
        assertActivityWithHeroCardAttachment(result);
    });

    it('activityWithMultiAttachments', function () {
        const data = {
            title: 'titleContent',
            text: 'textContent',
        };
        const result = getActivity('activityWithMultiAttachments', data);
        assertActivityWithMultiAttachments(result);
    });

    it('activityWithSuggestionActions', function () {
        const data = {
            title: 'titleContent',
            text: 'textContent',
        };
        const result = getActivity('activityWithSuggestionActions', data);
        assertActivityWithSuggestionActions(result);
    });

    it('messageActivityAll', function () {
        const data = {
            title: 'titleContent',
            text: 'textContent',
        };
        const result = getActivity('messageActivityAll', data);
        assertMessageActivityAll(result);
    });

    it('activityWithMultiStructuredSuggestionActions', function () {
        const data = {
            text: 'textContent',
        };
        const result = getActivity('activityWithMultiStructuredSuggestionActions', data);
        assertActivityWithMultiStructuredSuggestionActions(result);
    });

    it('activityWithMultiStringSuggestionActions', function () {
        const data = {
            text: 'textContent',
        };
        const result = getActivity('activityWithMultiStringSuggestionActions', data);
        assertActivityWithMultiStringSuggestionActions(result);
    });

    it('HeroCardTemplate', function () {
        const data = {
            type: 'herocard',
        };
        const result = getActivity('HeroCardTemplate', data);
        assertHeroCardActivity(result);
    });

    it('CustomizedCardTemplate', function () {
        const result = getActivity('customizedCardActionActivity', undefined);
        assertCustomizedCardActivity(result);
    });

    it('ThumbnailCardTemplate', function () {
        const data = {
            type: 'thumbnailcard',
        };
        const result = getActivity('ThumbnailCardTemplate', data);
        assertThumbnailCardActivity(result);
    });

    it('AudioCardTemplate', function () {
        const data = {
            type: 'audiocard',
        };
        const result = getActivity('AudioCardTemplate', data);
        assertAudioCardActivity(result);
    });

    it('VideoCardTemplate', function () {
        const data = {
            type: 'videocard',
        };
        const result = getActivity('VideoCardTemplate', data);
        assertVideoCardActivity(result);
    });

    it('SigninCardTemplate', function () {
        const data = {
            signinlabel: 'Sign in',
            url: 'https://login.microsoftonline.com/',
        };
        const result = getActivity('SigninCardTemplate', data);
        assertSigninCardActivity(result);
    });

    it('OAuthCardTemplate', function () {
        const data = {
            connectionName: 'MyConnection',
            signinlabel: 'Sign in',
            url: 'https://login.microsoftonline.com/',
        };
        const result = getActivity('OAuthCardTemplate', data);
        assertOAuthCardActivity(result);
    });

    it('AnimationCardTemplate', function () {
        const result = getActivity('AnimationCardTemplate', undefined);
        assertAnimationCardActivity(result);
    });

    it('ReceiptCardTemplate', function () {
        const data = {
            type: 'ReceiptCard',
            receiptItems: [
                {
                    title: 'Data Transfer',
                    price: '$ 38.45',
                    quantity: '368',
                    image: {
                        url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png',
                    },
                },
                {
                    title: 'App Service',
                    price: '$ 45.00',
                    quantity: '720',
                    image: {
                        url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png',
                    },
                },
            ],
        };
        const result = getActivity('ReceiptCardTemplate', data);
        assertReceiptCardActivity(result);
    });

    it('SuggestedActionsReference', function () {
        const data = {
            text: 'textContent',
        };
        const result = getActivity('SuggestedActionsReference', data);
        assertSuggestedActionsReferenceActivity(result);
    });
});

function assertSuggestedActionsReferenceActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert.strictEqual(activity.text, 'textContent');
    assert.strictEqual(activity.suggestedActions.actions.length, 5);
    assert.strictEqual(activity.suggestedActions.actions[0].value, 'Add todo');
    assert.strictEqual(activity.suggestedActions.actions[1].value, 'View Todo');
    assert.strictEqual(activity.suggestedActions.actions[2].value, 'Remove Todo');
    assert.strictEqual(activity.suggestedActions.actions[3].value, 'Cancel');
    assert.strictEqual(activity.suggestedActions.actions[4].value, 'Help');
}

function assertOAuthCardActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.oauth');
    const card = activity.attachments[0].content;
    assert(card);
    assert.strictEqual(card.text, "This is some text describing the card, it's cool because it's cool");
    assert.strictEqual(card.connectionName, 'MyConnection');
    assert.strictEqual(card.buttons.length, 1);
    assert.strictEqual(card.buttons[0].title, 'Sign in');
    assert.strictEqual(card.buttons[0].type, 'signin');
    assert.strictEqual(card.buttons[0].value, 'https://login.microsoftonline.com/');
}

function assertSigninCardActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.signin');
    const card = activity.attachments[0].content;
    assert(card);
    assert.strictEqual(card.buttons.length, 1);
    assert.strictEqual(card.buttons[0].title, 'Sign in');
    assert.strictEqual(card.buttons[0].type, 'signin');
    assert.strictEqual(card.buttons[0].value, 'https://login.microsoftonline.com/');
}

function assertVideoCardActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.video');
    const card = activity.attachments[0].content;
    assert(card);
    assert.strictEqual(card.title, 'Cheese gromit!');
    assert.strictEqual(card.subtitle, 'videocard');
    assert.strictEqual(card.text, "This is some text describing the card, it's cool because it's cool");
    assert.strictEqual(card.image.url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.media[0].url, 'https://youtu.be/530FEFogfBQ');
    assert.strictEqual(card.shareable, false);
    assert.strictEqual(card.autoloop, true);
    assert.strictEqual(card.autostart, true);
    assert.strictEqual(card.aspect, '16:9');
    assert.strictEqual(card.buttons.length, 3);

    for (let i = 0; i < card.buttons.length; i++) {
        assert.strictEqual(card.buttons[i].title, `Option ${i + 1}`);
    }
}

function assertAudioCardActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.audio');
    const card = activity.attachments[0].content;
    assert(card);
    assert.strictEqual(card.title, 'Cheese gromit!');
    assert.strictEqual(card.subtitle, 'audiocard');
    assert.strictEqual(card.text, "This is some text describing the card, it's cool because it's cool");
    assert.strictEqual(card.image.url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.media[0].url, 'https://contoso.com/media/AllegrofromDuetinCMajor.mp3');
    assert.strictEqual(card.shareable, false);
    assert.strictEqual(card.autoloop, true);
    assert.strictEqual(card.autostart, true);
    assert.strictEqual(card.aspect, '16:9');
    assert.strictEqual(card.buttons.length, 3);

    for (let i = 0; i < card.buttons.length; i++) {
        assert.strictEqual(card.buttons[i].title, `Option ${i + 1}`);
    }
}

function assertCustomizedCardActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'cardaction');
    const card = activity.attachments[0].content;
    assert(card);
    assert.strictEqual(card.type, 'yyy');
    assert.strictEqual(card.title, 'title');
    assert.strictEqual(card.value, 'value');
    assert.strictEqual(card.text, 'text');
}

function assertThumbnailCardActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.thumbnail');
    const card = activity.attachments[0].content;
    assert(card);
    assert.strictEqual(card.title, 'Cheese gromit!');
    assert.strictEqual(card.subtitle, 'thumbnailcard');
    assert.strictEqual(card.text, "This is some text describing the card, it's cool because it's cool");
    assert.strictEqual(card.images[0].url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.images[1].url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.buttons.length, 3);

    for (let i = 0; i < card.buttons.length; i++) {
        assert.strictEqual(card.buttons[i].title, `Option ${i + 1}`);
    }
}

function assertHeroCardActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.hero');
    const card = activity.attachments[0].content;
    assert(card);
    assert.strictEqual(card.title, 'Cheese gromit!');
    assert.strictEqual(card.subtitle, 'herocard');
    assert.strictEqual(card.text, "This is some text describing the card, it's cool because it's cool");
    assert.strictEqual(card.images[0].url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.images[1].url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.buttons.length, 3);

    for (let i = 0; i < card.buttons.length; i++) {
        assert.strictEqual(card.buttons[i].title, `Option ${i + 1}`);
    }
}

function assertActivityWithMultiStringSuggestionActions(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
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
    assert.strictEqual(activity.type, ActivityTypes.Message);
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
    assert.strictEqual(activity.type, ActivityTypes.Message);
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
    assert(card);

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
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert.strictEqual(activity.text, 'textContent');
    assert.strictEqual(activity.suggestedActions.actions.length, 2);
    assert.strictEqual(activity.suggestedActions.actions[0].title, 'firstItem');
    assert.strictEqual(activity.suggestedActions.actions[0].value, 'firstItem');
    assert.strictEqual(activity.suggestedActions.actions[1].title, 'titleContent');
    assert.strictEqual(activity.suggestedActions.actions[1].value, 'textContent');
}

function assertActivityWithMultiAttachments(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 2);
    assert.strictEqual(activity.attachments[1].contentType, 'application/vnd.microsoft.card.thumbnail');
    const card = activity.attachments[1].content;
    assert(card);
    assert.strictEqual(card.title, 'Cheese gromit!');
    assert.strictEqual(card.subtitle, 'type');
    assert.strictEqual(card.text, "This is some text describing the card, it's cool because it's cool");
    assert.strictEqual(card.images[0].url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.images[1].url, 'https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg');
    assert.strictEqual(card.buttons.length, 3);

    for (let i = 0; i < card.buttons.length; i++) {
        assert.strictEqual(card.buttons[i].title, `Option ${i + 1}`);
    }
}

function assertActivityWithHeroCardAttachment(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.hero');
    const card = activity.attachments[0].content;
    assert(card);

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

function assertCustomizedActivityType(activity) {
    assert.strictEqual(activity.type, 'xxx');
    assert.strictEqual(activity.name, 'hi');
    assert.strictEqual(activity.text, '{"a":"b"}');
    assert.strictEqual(activity.speak, '{"c":"d"}');
}

function assertHandoffActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Handoff);
    assert.strictEqual(activity.name, 'textContent');
    assert.strictEqual(activity.value, 'textContent');
}

function assertCardActionActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.hero');
    const card = activity.attachments[0].content;
    assert(card);
    assert.strictEqual(card.title, 'titleContent');
    assert.strictEqual(card.text, 'textContent');
    assert.strictEqual(card.buttons.length, 1, 'should have one button');
    const button = card.buttons[0];
    assert.strictEqual(button.type, 'imBack');
    assert.strictEqual(button.title, 'titleContent');
    assert.strictEqual(button.value, 'textContent');
}

function assertAdaptiveCardActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1, 'should have one attachment');
    assert.strictEqual(
        activity.attachments[0].contentType,
        'application/vnd.microsoft.card.adaptive',
        'attachment type should be adaptivecard'
    );
    assert.strictEqual(activity.attachments[0].content.body[0].text, 'test', 'text of first body should have value');
}

function assertMultiAdaptiveCardActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 3);
    for (let i = 0; i < activity.attachments.length; i++) {
        assert.strictEqual(activity.attachments[i].contentType, 'application/vnd.microsoft.card.adaptive');
        assert.strictEqual(activity.attachments[i].content.body[0].text, `test${i}`);
    }
}

function assertEventActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Event);
    assert.strictEqual(activity.name, 'textContent');
    assert.strictEqual(activity.value, 'textContent');
}

function assertAnimationCardActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.animation');
    const card = activity.attachments[0].content;
    assert(card);

    assert.strictEqual(card.title, 'Animation Card');
    assert.strictEqual(card.subtitle, 'look at it animate');
    assert.strictEqual(card.autostart, true);
    assert.strictEqual(
        card.image.url,
        'https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png'
    );
    assert.strictEqual(card.media[0].url, 'http://oi42.tinypic.com/1rchlx.jpg');
}

function assertReceiptCardActivity(activity) {
    assert.strictEqual(activity.type, ActivityTypes.Message);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.receipt');
    const card = activity.attachments[0].content;
    assert(card);

    assert.strictEqual(card.title, 'John Doe');
    assert.strictEqual(card.tax, '$ 7.50');
    assert.strictEqual(card.total, '$ 90.95');

    const buttons = card.buttons;
    assert.strictEqual(buttons.length, 1);
    const button = buttons[0];
    assert.strictEqual(button.title, 'More information');
    assert.strictEqual(button.type, 'openUrl');
    assert.strictEqual(button.value, 'https://azure.microsoft.com/en-us/pricing/');
    assert.strictEqual(
        button.image,
        'https://account.windowsazure.com/content/6.10.1.38-.8225.160809-1618/aux-pre/images/offer-icon-freetrial.png'
    );

    const facts = card.facts;
    assert.strictEqual(facts.length, 2);
    assert.strictEqual(facts[0].key, 'Order Number');
    assert.strictEqual(facts[0].value, '1234');
    assert.strictEqual(facts[1].key, 'Payment Method');
    assert.strictEqual(facts[1].value, 'VISA 5555-****');

    const items = card.items;
    assert.strictEqual(items.length, 2);
    assert.strictEqual(items[0].title, 'Data Transfer');
    assert.strictEqual(
        items[0].image.url,
        'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png'
    );
    assert.strictEqual(items[0].price, '$ 38.45');
    assert.strictEqual(items[0].quantity, '368');
    assert.strictEqual(items[1].title, 'App Service');
    assert.strictEqual(
        items[1].image.url,
        'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png'
    );
    assert.strictEqual(items[1].price, '$ 45.00');
    assert.strictEqual(items[1].quantity, '720');
}
