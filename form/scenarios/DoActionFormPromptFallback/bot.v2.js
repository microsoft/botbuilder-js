
const task_recognizer = function (context) {
    return context.request.text.toLowerCase() === 'hi';
};

const form_recognizer = function (context) {
    const text = context.request.text.toLowerCase();
    const tokens = text.split(' ');
    if (tokens.length === 2) {
        switch (tokens[0]) {
            case 'x:': {
                context.local.x = tokens[1];
                return true;
            }
            case 'y:': {
                context.local.y = tokens[1];
                return true;
            }
            case 'z:': {
                context.local.z = tokens[1];
                return true;
            }
            default:
                return false;
        }
    }
    return false;
};

const submit_process = function (context) {
    context.responses.push({ text: `x: ${context.local.x} y: ${context.local.y} z: ${context.local.z}` });
};

module.exports = {
    task_recognizer: task_recognizer,
    form_recognizer: form_recognizer,
    submit_process: submit_process
};
