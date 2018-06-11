#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const https = require ('https');

module.exports = {
    Translate (Text, subscriptionKey, tgtLang) {
        let host = 'api.cognitive.microsofttranslator.com';
        let path = '/translate?api-version=3.0';
        let content = JSON.stringify ([{'Text' : Text}]);
        let request_params = {
            method : 'POST',
            hostname : host,
            path : path + '&to=' + tgtLang + '&includeAlignment=true',
            headers : {
                'Content-Type' : 'application/json',
                'Ocp-Apim-Subscription-Key' : subscriptionKey,
                'X-ClientTraceId' : get_guid (),
            }
        };
    
        let req = https.request (request_params, function (response) {
            let body = '';
            response.on ('data', function (d) {
                body += d;
            });
            response.on ('end', function () {
                let json = JSON.stringify(JSON.parse(body), null, 4);
                return {
                        'lData': json,
                        'status': 0
                       };
            });
            response.on ('error', function (e) {
                return {
                        'lData': e.message,
                        'status': 1
                       };
            });
        });
        req.write (content);
        req.end ();
    }
};

let get_guid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

