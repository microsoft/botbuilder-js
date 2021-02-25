/**
 * Return expected properties for codeIntent utterance 'intent a1 b2'.
 *
 * @returns {*} Object of expected telemtry properties.
 */
const getCodeIntentProperties = () => {
    return {
        TopIntent: 'codeIntent',
        TopIntentScore: '1',
        Intents: '{"codeIntent":{"score":1,"pattern":"(?<code>[a-z][0-9])"}}',
        Entities:
            '{"code":["a1","b2"],"$instance":{"code":[{"startIndex":7,"endIndex":9,"score":1,"text":"a1","type":"code"},{"startIndex":10,"endIndex":12,"score":1,"text":"b2","type":"code"}]}}',
        AdditionalProperties: undefined,
    };
};

/**
 * Return expected properties for colorIntent utterance 'I would like colors red and orange'.
 *
 * @returns {*} Object of expected telemtry properties.
 */
const getColorIntentProperties = () => {
    return {
        TopIntent: 'colorIntent',
        TopIntentScore: '1',
        Intents: '{"colorIntent":{"score":1,"pattern":"(color|colour)"}}',
        Entities:
            '{"color":["red","orange"],"$instance":{"color":[{"startIndex":19,"endIndex":23,"score":1,"text":"red","type":"color","resolution":{}},{"startIndex":27,"endIndex":34,"score":1,"text":"orange","type":"color","resolution":{}}]}}',
        AdditionalProperties: undefined,
    };
};

/**
 * Return expected properties for greetingIntent 'howdy'.
 *
 * @returns {*} Object of expected telemtry properties.
 */
const getGreetingIntentProperties = () => {
    return {
        TopIntent: 'greeting',
        TopIntentScore: '1',
        Intents: '{"greeting":{"score":1,"pattern":"howdy"}}',
        Entities: '{}',
        AdditionalProperties: undefined,
    };
};

/**
 * Return expected properties for CrossTrainedRecognizer ChooseIntent.
 *
 * @returns {*} Object of expected telemtry properties.
 */
const getChooseIntentProperties = () => {
    return {
        AdditionalProperties:
            '{"candidates":[{"id":"y","intent":"y","score":1,"result":{"text":"criss-cross applesauce","intents":{"y":{"score":1,"pattern":"criss-cross applesauce"}},"entities":{},"id":"y"}},{"id":"z","intent":"z","score":1,"result":{"text":"criss-cross applesauce","intents":{"z":{"score":1,"pattern":"criss-cross applesauce"}},"entities":{},"id":"z"}}]}',
        Entities: '{}',
        Intents: '{"ChooseIntent":{"score":1}}',
        TopIntent: 'ChooseIntent',
        TopIntentScore: '1',
    };
};

/**
 * Return expected properties for x intent.
 *
 * @returns {*} Object of expected telemtry properties.
 */
const getXIntentProperties = () => {
    return {
        AdditionalProperties: '{"id":"x"}',
        Entities: '{}',
        Intents: '{"x":{"score":1,"pattern":"x"}}',
        TopIntent: 'x',
        TopIntentScore: '1',
    };
};

module.exports = {
    getCodeIntentProperties,
    getColorIntentProperties,
    getGreetingIntentProperties,
    getChooseIntentProperties,
    getXIntentProperties,
};
