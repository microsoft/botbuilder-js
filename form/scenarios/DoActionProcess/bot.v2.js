module.exports = {
    func1: function (context) {
        context.global.x = 1;
    },

    func2: function (context) {
        context.global.x = 2;
    },

    func3: function (context) {
        context.global.x = 2;
    },

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
