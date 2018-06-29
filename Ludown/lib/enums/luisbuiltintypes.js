/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = {
    consolidatedList : [
        "datetimeV2",
        "age",
        "dimension",
        "email",
        "money",
        "number",
        "ordinal",
        "percentage",
        "phoneNumber",
        "temperature",
        "url",
        "datetime",
        "keyPhrase"
    ],
    perLocaleAvailability: {
        "de-de": {
            "datetimeV2": "datetime",
            "email": null,
            "url": null
        },
        "zh-cn": {
            "email": null,
            "phoneNumber": null,
            "url": null, 
            "datetime": "datetimeV2",
            "keyPhrase": null
        },
        "en-us": {
            "datetime": "datetimeV2"
        },
        "fr-fr":{
            "email": null,
            "phoneNumber": null,
            "url": null, 
            "datetime": "datetimeV2",
        }, 
        "fr-ca": {
            "datetimeV2": null,
            "age": null,
            "dimension": null,
            "email": null,
            "money": null,
            "number": null,
            "ordinal": null,
            "percentage": null,
            "phoneNumber": null,
            "temperature": null,
            "url": null,
            "datetime": null
        },
        "es-es": {
            "email": null,
            "url": null, 
            "datetime": "datetimeV2"
        },
        "es-mx": {
            "datetimeV2": null,
            "age": null,
            "dimension": null,
            "email": null,
            "money": null,
            "number": null,
            "ordinal": null,
            "percentage": null,
            "phoneNumber": null,
            "temperature": null,
            "url": null,
            "datetime": null
        },
        "it-it": {
            "datetimeV2": "datetime",
            "email": null,
            "phoneNumber": null,
            "url": null
        },
        "ja-jp": {
            "datetimeV2": "datetime",
            "email": null,
            "phoneNumber": null,
            "url": null
        },
        "pt-br": {
            "email": null,
            "datetime": "datetimeV2",
            "url": null, 
        },
        "ko-kr": {
            "datetimeV2": null,
            "age": null,
            "dimension": null,
            "email": null,
            "money": null,
            "number": null,
            "ordinal": null,
            "percentage": null,
            "phoneNumber": null,
            "temperature": null,
            "url": null,
            "datetime": null
        },
        "nl-nl": {
            "datetimeV2": null,
            "age": null,
            "dimension": null,
            "email": null,
            "money": null,
            "number": null,
            "ordinal": null,
            "percentage": null,
            "phoneNumber": null,
            "temperature": null,
            "url": null,
            "datetime": null
        }

    }
}