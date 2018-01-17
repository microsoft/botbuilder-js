module.exports = {
    recognize1: function (conversationContext) {
        return conversationContext.request.text === '1';
    },

    recognize2: function (conversationContext) {
        return conversationContext.request.text === '2';
    },

    funcBeforeResponse: function (conversationContext) {
        var response = conversationContext.responses.slice(-1).pop();
        conversationContext.responses[conversationContext.responses.length - 1].text = '((((' + response.text + '))))';
    }
};
