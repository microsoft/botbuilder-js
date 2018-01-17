module.exports.onLuis = function(context) {
    if (context.request.text === 'book a table this weekend for 4') {
        context.global.match = true;
        return true;
    }
    else {
        context.global.match = false;
        return false;
    }
}