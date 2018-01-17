module.exports.func = function (conversationContext) {
    var activity = conversationContext.request;
    if (conversationContext.resources.x1.y1.href === 'http://url1/path1?key1=value1&key2=value2' &&
        conversationContext.resources.x1.y2.href === 'http://url2/path2?key1=value1&key2=value2' &&
        conversationContext.resources.x2.y2.href === 'http://url3/path2?key1=value1&key2=value2') {
        return true;
    }
    return false;
}