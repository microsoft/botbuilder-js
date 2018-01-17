
const task_recognizer = function (context) {
    return context.request.text.toLowerCase() === 'hi';
};

const form_recognizer = function (context) {
    return false;
};

const submit_process = function (context) {
    context.responses.push({ booking: `to ${context.local.to} from ${context.local.from} departing ${context.local.departure}.` });
};

module.exports = {
    task_recognizer: task_recognizer,
    form_recognizer: form_recognizer,
    submit_process: submit_process
};
