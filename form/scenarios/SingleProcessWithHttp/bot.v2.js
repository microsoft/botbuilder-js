var options =  {
    host: 'mock',
    path: '/get?a=b',
    method: 'get'
};

module.exports.func = function (context) {
    var options =  {
        host: 'mock',
        path: '/get?a=b',
        method: 'get'
    };

    return http.request(options).then(function(response) {
        context.global.x = response.statusCode;
        var jsonBody = JSON.parse(response.body);
        if (response.statusCode !== "200") {
            throw "status error " + response.statusCode;
        }
    });
}

module.exports.hi = function (context) {
    return context.request.text === 'hi';
}
