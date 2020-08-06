const assert = require('assert');
const { ChoiceFactory } = require('../');
const { ActionTypes, CardAction } = require('botbuilder-core');

function assertActivity(received, expected) {
    assert(received, `Activity not returned.`);
    for (let key in expected) {
        const v = received[key];
        assert(v !== undefined, `Activity.${ key } missing.`);
        const ev = expected[key];
        assert(typeof v === typeof ev, `Activity.${ key } has invalid type of '${ typeof v }'.`);
        if (Array.isArray(ev)) {
            assert(v.length === ev.length, `Activity.${ key } has invalid length of '${ v.length }'.`);
            assert(JSON.stringify(v) === JSON.stringify(ev), `Activity.${ key } has invalid contents: ` + JSON.stringify(v));
        } else if (typeof ev === 'object') {
            assert(JSON.stringify(v) === JSON.stringify(ev), `Activity.${ key } has invalid contents: ` + JSON.stringify(v));
        } else {
            assert(v === ev, `Activity.${ key } has invalid value of '${ v }'.`);
        }
    }
}

const colorChoices = ['red', 'green', 'blue'];
const extraChoices = ['red', 'green', 'blue', 'alpha'];

const choicesWithActionTitle = [
    {
        value: 'red',
        action: {
            type: ActionTypes.ImBack,
            title: 'Red Color'
        }
    },
    {
        value: 'green',
        action: {
            type: ActionTypes.ImBack,
            title: 'Green Color'
        }
    },
    {
        value: 'blue',
        action: {
            type: ActionTypes.ImBack,
            title: 'Blue Color'
        }
    }
];

const choicesWithActionValue = [
    {
        value: 'red',
        action: {
            type: ActionTypes.ImBack,
            value: 'Red Color'
        }
    },
    {
        value: 'green',
        action: {
            type: ActionTypes.ImBack,
            value: 'Green Color'
        }
    },
    {
        value: 'blue',
        action: {
            type: ActionTypes.ImBack,
            value: 'Blue Color'
        }
    }
];

const choicesWithEmptyActions = [
    {
        value: 'red',
        action: {}
    },
    {
        value: 'green',
        action: {}
    },
    {
        value: 'blue',
        action: {}
    }
];

const choicesWithPostBacks = [
    {
        value: 'red',
        action: {
            type: ActionTypes.PostBack
        }
    },
    {
        value: 'green',
        action: {
            type: ActionTypes.PostBack
        }
    },
    {
        value: 'blue',
        action: {
            type: ActionTypes.PostBack
        }
    }
];

function assertChoices(choices, actionValues, actionType = 'imBack') {
    assert(choices.length === actionValues.length, 'test data prepared incorrectly.');
    for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        const val = actionValues[i];
        assert(choice.action.type === actionType, `Expected action.type === ${ actionType }, received ${ choice.action.type }`);
        assert(choice.action.value === val, `Expected action.value === ${ val }, received ${ choice.action.value }`);
        assert(choice.action.title === val, `Expected action.title === ${ val }, received ${ choice.action.title }`);

    }
}

describe('The ChoiceFactory', function() {
    it('should render choices inline.', () => {
        const activity = ChoiceFactory.inline(colorChoices, 'select from:');
        assertActivity(activity, {
            text: `select from: (1) red, (2) green, or (3) blue`
        });
    });

    it('should render choices as a list.', () => {
        const activity = ChoiceFactory.list(colorChoices, 'select from:');
        assertActivity(activity, {
            text: `select from:\n\n   1. red\n   2. green\n   3. blue`
        });
    });

    it('should render choices as suggested actions.', () => {
        const activity = ChoiceFactory.suggestedAction(colorChoices, 'select from:');
        assertActivity(activity, {
            text: `select from:`,
            suggestedActions: {
                actions: [
                    { type: 'imBack', value: 'red', title: 'red' },
                    { type: 'imBack', value: 'green', title: 'green' },
                    { type: 'imBack', value: 'blue', title: 'blue' }
                ]
            }
        });
    });

    it('should suggest the same action when a suggested action is provided', () => {
        const activity = ChoiceFactory.suggestedAction([{ value: 'Signin', action: { type: ActionTypes.Signin } }]);
        assert.ok(activity.suggestedActions.actions[0].type === ActionTypes.Signin,
            `Expected the suggestion action to be ${ ActionTypes.Signin } but got: ${ activity.suggestedActions.actions[0].type }`);
    });

    it('should use hero cards for channels that do not support choices (Teams, Cortana)', () => {
        const expectedActivity = {
            'type': 'message',
            'attachmentLayout': 'list',
            'attachments': [
                {
                    'contentType': 'application/vnd.microsoft.card.hero',
                    'content': {
                        'text': 'select from:',
                        'buttons': [
                            {
                                'title': 'red',
                                'type': 'imBack',
                                'value': 'red'
                            },
                            {
                                'title': 'green',
                                'type': 'imBack',
                                'value': 'green'
                            },
                            {
                                'title': 'blue',
                                'type': 'imBack',
                                'value': 'blue'
                            }
                        ]
                    }
                }
            ],
            'inputHint': 'expectingInput'
        };

        let activities = ChoiceFactory.forChannel('cortana', colorChoices, 'select from:');


        assertActivity(activities, expectedActivity);

        const choices = colorChoices.map(value => ({
            value,
            action: { type: ActionTypes.ImBack }
        }));

        activities = ChoiceFactory.forChannel('msteams', choices, 'select from:');
        assertActivity(activities, expectedActivity);
    });

    it('should render an inline list based on title length, choice length and channel', () => {
        const activity = ChoiceFactory.forChannel('skypeforbusiness', colorChoices, 'select from:');
        assertActivity(activity, {
            'type': 'message',
            'text': 'select from: (1) red, (2) green, or (3) blue',
            'inputHint': 'expectingInput'
        });
    });

    it('should automatically choose render style based on channel type.', () => {
        const activity = ChoiceFactory.forChannel('emulator', colorChoices, 'select from:');
        assertActivity(activity, {
            text: `select from:`,
            suggestedActions: {
                actions: [
                    { type: 'imBack', value: 'red', title: 'red' },
                    { type: 'imBack', value: 'green', title: 'green' },
                    { type: 'imBack', value: 'blue', title: 'blue' }
                ]
            }
        });
    });

    it('should use action.title to populate action.value if action.value is falsey.', () => {
        const preparedChoices = ChoiceFactory.toChoices(choicesWithActionTitle);
        assertChoices(preparedChoices, ['Red Color', 'Green Color', 'Blue Color']);
    });

    it('should use action.value to populate action.title if action.title is falsey.', () => {
        const preparedChoices = ChoiceFactory.toChoices(choicesWithActionValue);
        assertChoices(preparedChoices, ['Red Color', 'Green Color', 'Blue Color']);
    });

    it('should use choice.value to populate action.title and action.value if both are missing.', () => {
        const preparedChoices = ChoiceFactory.toChoices(choicesWithEmptyActions);
        assertChoices(preparedChoices, ['red', 'green', 'blue']);
    });

    it('should use provided ActionType.', () => {
        const preparedChoices = ChoiceFactory.toChoices(choicesWithPostBacks);
        assertChoices(preparedChoices, ['red', 'green', 'blue'], ActionTypes.PostBack);
    });

    it('should return a stylized list.', () => {
        const listActivity = ChoiceFactory.forChannel('emulator',
            ['choiceTitleOverTwentyChars'],
            'Test'
        );
        assert(listActivity.text === 'Test\n\n   1. choiceTitleOverTwentyChars');
    });
});
