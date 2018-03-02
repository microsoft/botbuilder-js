module.exports = function deriveParamsFromPath(path) {
    const params = [];
    const reg = /(?:{)([\w]+)(?:})/g;
    let result;
    while ((result = reg.exec(path))) {
        params.push(result[1]);
    }
    return params;
};