module.exports.func = function func(context) {
    context.responses.push({text: 'in func code recognizer', type: 'message'})
    var activity = context.request;
    if (/(add)/.test(activity.text)) {
        context.global.a = true;
        return true;
    }
    else if(/(get)/.test(activity.text)) {
        return 'a' in context.global;
    }
    else if (/(remove)/.test(activity.text)) {
        delete context.global.a;
        return true;
    }
    else {
        return false;
    }
}