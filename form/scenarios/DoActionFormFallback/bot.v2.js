
const task_recognizer = function (context) {
    return context.request.text.toLowerCase() === 'hi';
};

const submit_process = function (context) {
    context.responses.push({ text: `plate of ${context.local.eggs} eggs with a side of ${context.local.side} and ${context.local.bread} toast coming right up.` });
};

module.exports = {
    task_recognizer: task_recognizer,
    submit_process: submit_process
};
