/**
 * Return expected properties for codeIntent utterance 'intent a1 b2'.
 *
 * @returns {*} Object of expected telemtry properties.
 */
const getCodeIntentProperties = () => ({
    TopIntent: 'codeIntent',
    TopIntentScore: '1',
    Intents: JSON.stringify({
        codeIntent: {
            score: 1,
            pattern: '(?<code>[a-z][0-9])',
        },
    }),
    Entities: JSON.stringify({
        code: ['a1', 'b2'],
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
        color: ['red', 'orange'],
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
    }),
    AdditionalProperties: '{}',
});

module.exports = {
    getCodeIntentProperties,
    getColorIntentProperties,
};
