
function recognize1 (conversationContext) {
    return (/1/.test(conversationContext.request.text));
}

function process1 (conversationContext) {
    conversationContext.global.x1 = 1;
    conversationContext.responses.push({ text: 'from code in process1' });
}

function recognize2 (conversationContext) {
    return (/2/.test(conversationContext.request.text));
}

function process2 (conversationContext) {
    conversationContext.global.x2 = 2;
    conversationContext.responses.push({ text: 'from code in process2' });
}

function recognize3 (conversationContext) {
    return (/3/.test(conversationContext.request.text));
}

function process3 (conversationContext) {
    conversationContext.global.x3 = 3;
    conversationContext.responses.push({ text: 'from code in process3' });
}

module.exports = {
    recognize1 : recognize1,
    process1 : process1,
    recognize2 : recognize2,
    process2 : process2,
    recognize3 : recognize3,
    process3 : process3
};
