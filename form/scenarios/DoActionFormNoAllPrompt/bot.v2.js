
const task_recognizer = function (context) {
    if (context.request.text.toLowerCase() === 'hi') {
        return true;
    }
    if (context.request.text.toLowerCase() === 'hello to buckethead') {
        context.local.to = 'buckethead';
        context.local.message = 'hello';
        return true;
    }
    return false;
};

const form_recognizer = function (context) {
    const text = context.request.text.toLowerCase();
    const tokens = text.split(' ');
    switch (tokens[0]) {
        case 'to:': {
            context.local.to = tokens[1];
            return true;
        }
        case 'message:': {
            context.local.message = tokens[1];
            return true;
        }
        default:
            return false;
    }
};

const submit_process = function (context) {
    context.responses.push({ text: `to: ${context.local.to} message: ${context.local.message}` });
};

module.exports = {
    task_recognizer: task_recognizer,
    form_recognizer: form_recognizer,
    submit_process: submit_process
};
