/**
 * Return expected properties for codeIntent utterance 'intent a1 b2'.
 *
 * @returns {*} Object of expected telemtry properties.
 */
const getCodeIntentProperties = () => ({
    TopIntent: 'codeIntent',
    TopIntentScore: '1',
    Intents: JSON.stringify({ codeIntent: { score: 1, pattern: '(?<code>[a-z][0-9])' } }),
    Entities: JSON.stringify({
        $instance: {
            code: [
                {
                    startIndex: 7,
                    endIndex: 9,
                    score: 1,
                    text: 'a1',
                    type: 'code',
                },
                {
                    startIndex: 10,
                    endIndex: 12,
                    score: 1,
                    text: 'b2',
                    type: 'code',
                },
            ],
        },
        code: ['a1', 'b2'],
    }),
    AdditionalProperties: '{}',
});

/**
 * Return expected properties for colorIntent utterance 'I would like colors red and orange'.
 *
 * @returns {*} Object of expected telemtry properties.
 */
const getColorIntentProperties = () => ({
    TopIntent: 'colorIntent',
    TopIntentScore: '1',
    Intents: JSON.stringify({
        colorIntent: { score: 1, pattern: '(color|colour)' },
    }),
    Entities: JSON.stringify({
        $instance: {
            color: [
                {
                    startIndex: 19,
                    endIndex: 23,
                    score: 1,
                    text: 'red',
                    type: 'color',
                    resolution: {},
                },
                {
                    startIndex: 27,
                    endIndex: 34,
                    score: 1,
                    text: 'orange',
                    type: 'color',
                    resolution: {},
                },
            ],
        },
        color: ['red', 'orange'],
    }),
    AdditionalProperties: '{}',
});

/**
 * Return expected properties for greetingIntent utterence 'howdy'.
 *
 * @returns {*} Object of expected telemtry properties.
 */
const getGreetingIntentProperties = () => ({
    TopIntent: 'greeting',
    TopIntentScore: '1',
    Intents: JSON.stringify({
        greeting: { score: 1, pattern: 'howdy' },
    }),
    Entities: '{}',
    AdditionalProperties: '{}',
});

/**
 * Return expected properties for CrossTrainedRecognizer ChooseIntent.
 *
 * @returns {*} Object of expected telemtry properties.
 */
const getChooseIntentProperties = () => ({
    AdditionalProperties: JSON.stringify({
        candidates: [
            {
                id: 'y',
                intent: 'y',
                score: 1,
                result: {
                    text: 'criss-cross applesauce',
                    intents: {
                        y: {
                            score: 1,
                            pattern: 'criss-cross applesauce',
                        },
                    },
                    entities: {},
                    id: 'y',
                },
            },
            {
                id: 'z',
                intent: 'z',
                score: 1,
                result: {
                    text: 'criss-cross applesauce',
                    intents: {
                        z: {
                            score: 1,
                            pattern: 'criss-cross applesauce',
                        },
                    },
                    entities: {},
                    id: 'z',
                },
            },
        ],
    }),
    Entities: '{}',
    Intents: JSON.stringify({ ChooseIntent: { score: 1 } }),
    TopIntent: 'ChooseIntent',
    TopIntentScore: '1',
});

/**
 * Return expected properties for x intent.
 *
 * @returns {*} Object of expected telemtry properties.
 */
const getXIntentProperties = () => ({
    AdditionalProperties: JSON.stringify({ id: 'x' }),
    Entities: '{}',
    Intents: JSON.stringify({ x: { score: 1, pattern: 'x' } }),
    TopIntent: 'x',
    TopIntentScore: '1',
});

module.exports = {
    getCodeIntentProperties,
    getColorIntentProperties,
    getGreetingIntentProperties,
    getChooseIntentProperties,
    getXIntentProperties,
};
