export function func(context) {
    context.responses.push({text: 'in func code recognizer', type: 'message'})
    var activity = context.request;
    if (/(add)/.test(activity.text)) {
        context.addContextEntity("a", "1");
        return true;
    }
    else if(/(get)/.test(activity.text)) {
        if (context.containsContextEntity("a")) {
            return true;
        }
        else {
            return false;
        }
    }
    else if (/(remove)/.test(activity.text)) {
        context.removeContextEntity("a");
        return true;
    }
    else {
        return false;
    }
}