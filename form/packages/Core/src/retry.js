// Copyright (c) Microsoft Corporation. All rights reserved.

const promisedRetry = function (f, delay, count, errors) {
    errors = errors || [];
    
    const promiseWrapper = function () {
        return new Promise((resolve, reject)=> {
            try {
                resolve(f());
            } catch(err) {
                reject(err);
            }
        });
    };

    if (typeof count !== 'number') {
        throw new Error('count is not a number');
    }

    if (count === 0) {
        const message = `Retries exhausted.\n${JSON.stringify(errors, null, 2)}`;
        return Promise.reject(message);
    }

    return promiseWrapper().then(function (rsp) {
        return Promise.resolve(rsp);
    }).catch(function (err) {
        errors.push(err.toString());
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                promisedRetry(f, delay, --count, errors)
                    .then(function (rsp) {
                        resolve(rsp);
                    }).catch(function (err) {
                        reject(err);
                    });
            }, delay);
        });
    });
};

module.exports.promisedRetry = promisedRetry;