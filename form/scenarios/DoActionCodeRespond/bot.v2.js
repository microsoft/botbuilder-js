module.exports.recognize1 =  function (context) {
    if ((/1/.test(context.request.text))) {
        context.local.x = 'one';
        return true;
    }
    return false;
}
