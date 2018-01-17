module.exports = {
    recognize1: function (conversationContext) {
        return conversationContext.request.text === '1';
    },

    recognize2: function (conversationContext) {
        return conversationContext.request.text === '2';
    },

    recognize3: function (conversationContext) {
        return conversationContext.request.text === '3';
    }    
};
