module.exports.recognize3 = function recognize3(conversationCore) {
    if (/(g'day mate|struth)/.test(conversationCore.request.text.toLowerCase())) {
        return true;
    }
    else {
        return false;
    }
}
