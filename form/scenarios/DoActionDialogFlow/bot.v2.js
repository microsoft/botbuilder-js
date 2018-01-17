
module.exports.recognize_1 = function (conversationContext) {
    return conversationContext.request.text === '1';
}

module.exports.recognize_2 = function (conversationContext) {
    return conversationContext.request.text === '2';
}
