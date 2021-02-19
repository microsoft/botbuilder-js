function getCodeIntentProperties()
{
    return {
        TopIntent: 'codeIntent',
        TopIntentScore: '1',
        Intents: '{"codeIntent":{"score":1,"pattern":"(?<code>[a-z][0-9])"}}',
        Entities:
        '{"code":["a1","b2"],"$instance":{"code":[{"startIndex":7,"endIndex":9,"score":1,"text":"a1","type":"code"},{"startIndex":10,"endIndex":12,"score":1,"text":"b2","type":"code"}]}}',
        AdditionalProperties: undefined,
    };
}

function getColorIntentProperties()
{
    return {
        TopIntent: 'colorIntent',
        TopIntentScore: '1',
        Intents: '{"colorIntent":{"score":1,"pattern":"(color|colour)"}}',
        Entities:
        '{"color":["red","orange"],"$instance":{"color":[{"startIndex":19,"endIndex":23,"score":1,"text":"red","type":"color","resolution":{}},{"startIndex":27,"endIndex":34,"score":1,"text":"orange","type":"color","resolution":{}}]}}',
        AdditionalProperties: undefined,
    };
}

module.exports = {
    getCodeIntentProperties,
    getColorIntentProperties,
};
