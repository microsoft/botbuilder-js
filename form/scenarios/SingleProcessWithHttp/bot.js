console.log('http sample');

var options =  {
    host: 'mock',
    path: '/get?a=b',
    method: 'get'
};

export function func(conversationContext) {
    var options =  {
        host: 'mock',
        path: '/get?a=b',
        method: 'get'
    };

    return http.request(options).then(function(response) {
        conversationContext.addContextEntity('x', response.statusCode);
        var jsonBody = JSON.parse(response.body);
        if (response.statusCode !== "200") {
            throw "status error " + response.statusCode;
        }
    });
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}
