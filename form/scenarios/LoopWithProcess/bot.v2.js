const dec = function(conversationContext) {
    if ( conversationContext.local.a === undefined) {
        conversationContext.local.a = '1';
        return 'No';
    }
    else {
        return 'Yes';
    }
};

const proc = function() {
}

const hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports = {
    dec: dec,
    proc: proc,
    hi: hi
}