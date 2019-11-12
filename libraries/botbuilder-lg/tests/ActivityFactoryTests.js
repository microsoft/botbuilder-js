const { TemplateEngine, ActivityFactory } = require('../');
const assert = require('assert');

function getTemplateEngine(){
    const filePath =  `${ __dirname }/testData/Examples/NormalStructuredLG.lg`;
    return new TemplateEngine().addFile(filePath);
}

function getActivity(templateName, data){
    const engine = getTemplateEngine();
    const lgResult = JSON.stringify(engine.evaluateTemplate(templateName, data));
    return ActivityFactory.CreateActivity(lgResult);
}


describe('ActivityFactoryTest', function() {
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

    it('eventActivity', function() {
        let data = {
            text: 'textContent',
            adaptiveCardTitle: 'test'
        };
        let result = getActivity('eventActivity', data);
        assertEventActivity(result);
    });

    it('activityWithHeroCardAttachment', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent'
        };
        let result = getActivity('activityWithHeroCardAttachment', data);
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
            title: 'titleContent',
            text: 'textContent'
        };
        let result = getActivity('activityWithMultiStructuredSuggestionActions', data);
        assertActivityWithMultiStructuredSuggestionActions(result);
    });

    it('activityWithMultiStringSuggestionActions', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent'
        };
        let result = getActivity('activityWithMultiStringSuggestionActions', data);
        assertActivityWithMultiStringSuggestionActions(result);
    });

    it('HeroCardTemplate', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent',
            type: 'herocard'
        };
        let result = getActivity('HeroCardTemplate', data);
        assertHeroCardActivity(result);
    });

    it('ThumbnailCardTemplate', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent',
            type: 'thumbnailcard'
        };
        let result = getActivity('ThumbnailCardTemplate', data);
        assertThumbnailCardActivity(result);
    });

    it('AudioCardTemplate', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent',
            type: 'audiocard'
        };
        let result = getActivity('AudioCardTemplate', data);
        assertAudioCardActivity(result);
    });

    it('VideoCardTemplate', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent',
            type: 'videocard'
        };
        let result = getActivity('VideoCardTemplate', data);
        assertVideoCardActivity(result);
    });

    it('SigninCardTemplate', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent',
            signinlabel: 'Sign in',
            url: 'https://login.microsoftonline.com/'
        };
        let result = getActivity('SigninCardTemplate', data);
        assertSigninCardActivity(result);
    });

    it('OAuthCardTemplate', function() {
        let data = {
            title: 'titleContent',
            text: 'textContent',
            connectionName: 'MyConnection',
            signinlabel: 'Sign in',
            url: 'https://login.microsoftonline.com/'
        };
        let result = getActivity('OAuthCardTemplate', data);
        assertOAuthCardActivity(result);
    });

    it('SuggestedActionsReference', function() {
        let data = {
            title: 'titleContent',
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
    assert.strictEqual(activity.suggestedActions.actions[0].text, 'Add todo');
    assert.strictEqual(activity.suggestedActions.actions[1].text, 'View Todo');
    assert.strictEqual(activity.suggestedActions.actions[2].text, 'Remove Todo');
    assert.strictEqual(activity.suggestedActions.actions[3].text, 'Cancel');
    assert.strictEqual(activity.suggestedActions.actions[4].text, 'Help');
}

function assertOAuthCardActivity(activity) {
    assert.strictEqual(activity.type, 'message');
    assert(activity.text === undefined);
    assert(activity.speak === undefined);
    assert.strictEqual(activity.attachments.length, 1);
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.oauth');
    const card = activity.attachments[0].content;
    assert(card !== undefined);
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
    assert.strictEqual(activity.suggestedActions.actions[0].displayText, 'first suggestion');
    assert.strictEqual(activity.suggestedActions.actions[0].title, 'first suggestion');
    assert.strictEqual(activity.suggestedActions.actions[0].text, 'first suggestion');
    assert.strictEqual(activity.suggestedActions.actions[1].displayText, 'second suggestion');
    assert.strictEqual(activity.suggestedActions.actions[1].title, 'second suggestion');
    assert.strictEqual(activity.suggestedActions.actions[1].text, 'second suggestion');
    assert.strictEqual(activity.suggestedActions.actions[2].displayText, 'third suggestion');
    assert.strictEqual(activity.suggestedActions.actions[2].title, 'third suggestion');
    assert.strictEqual(activity.suggestedActions.actions[2].text, 'third suggestion');
}

function assertActivityWithMultiStructuredSuggestionActions(activity) {
    assert.strictEqual(activity.type, 'message');
    assert.strictEqual(activity.text, 'textContent');
    assert.strictEqual(activity.suggestedActions.actions.length, 3);
    assert.strictEqual(activity.suggestedActions.actions[0].value, 'first suggestion');
    assert.strictEqual(activity.suggestedActions.actions[0].title, 'first suggestion');
    assert.strictEqual(activity.suggestedActions.actions[0].text, 'first suggestion');
    assert.strictEqual(activity.suggestedActions.actions[1].value, 'second suggestion');
    assert.strictEqual(activity.suggestedActions.actions[1].title, 'second suggestion');
    assert.strictEqual(activity.suggestedActions.actions[1].text, 'second suggestion');
    assert.strictEqual(activity.suggestedActions.actions[2].value, 'third suggestion');
    assert.strictEqual(activity.suggestedActions.actions[2].title, 'third suggestion');
    assert.strictEqual(activity.suggestedActions.actions[2].text, 'third suggestion');
}

function assertMessageActivityAll(activity) {
    assert.strictEqual(activity.type, 'message');
    assert.strictEqual(activity.text, 'textContent');
    assert.strictEqual(activity.speak, 'textContent');
    assert.strictEqual(activity.inputHint, 'accepting');
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
    assert.strictEqual(activity.suggestedActions.actions.length, 2);
    assert.strictEqual(activity.suggestedActions.actions[0].displayText, 'firstItem');
    assert.strictEqual(activity.suggestedActions.actions[0].title, 'firstItem');
    assert.strictEqual(activity.suggestedActions.actions[0].text, 'firstItem');
    assert.strictEqual(activity.suggestedActions.actions[1].title, 'titleContent');
    assert.strictEqual(activity.suggestedActions.actions[1].value, 'textContent');
}

function assertActivityWithSuggestionActions(activity) {
    assert.strictEqual(activity.type, 'message');
    assert.strictEqual(activity.text, 'textContent');
    assert.strictEqual(activity.suggestedActions.actions.length, 2);
    assert.strictEqual(activity.suggestedActions.actions[0].displayText, 'firstItem');
    assert.strictEqual(activity.suggestedActions.actions[0].title, 'firstItem');
    assert.strictEqual(activity.suggestedActions.actions[0].text, 'firstItem');
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
    assert.strictEqual(card.title, 'titleContent');
    assert.strictEqual(card.text, 'textContent');
    assert.strictEqual(card.buttons.length, 1, 'should have one button');
    const button = card.buttons[0];
    assert.strictEqual(button.type, 'imBack');
    assert.strictEqual(button.title, 'titleContent');
    assert.strictEqual(button.value, 'textContent');
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

function assertEventActivity(activity) {
    assert.strictEqual(activity.type, 'event');
    assert.strictEqual(activity.name, 'textContent');
    assert.strictEqual(activity.value, 'textContent');
}