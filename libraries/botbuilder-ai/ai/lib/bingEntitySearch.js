"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
let serviceEndpoint = 'https://api.cognitive.microsoft.com/bing/v7.0/entities';
class BingEntitySearch {
    constructor(options) {
        this.options = options;
    }
    search(queryOptions) {
        let headers = {
            'Ocp-Apim-Subscription-Key': this.options.subscriptionKey
        };
        headers['X-Search-Location'] = `lat:${queryOptions.latitude || 47.61002};long:${queryOptions.longitude || -122.1879};re:${queryOptions.radius || 22}`;
        return request({
            url: `${serviceEndpoint}?mkt=${queryOptions.mkt || 'en-US'}&q=${queryOptions.q}&responseFilter=${queryOptions.responseFilter || this.options.responseFilter}`,
            method: 'GET',
            headers: headers
        }).then((response) => {
            return JSON.parse(response);
        });
    }
}
exports.BingEntitySearch = BingEntitySearch;
/**
 * default search response renderer
 */
function defaultRenderSearchResponse(context, matchResults) {
    const searchResponse = matchResults.searchResponse;
    if (searchResponse) {
        if (searchResponse.entities && searchResponse.entities.value.length > 0) {
            // send reply as response
            for (let answer of searchResponse.entities.value) {
                let text = '';
                if (answer.name)
                    text += `**${answer.name}**\n\n`;
                if (answer.description)
                    text += `${answer.description}\n\n`;
                if (answer.url)
                    text += `${answer.url}\n\n`;
                if (answer.telephone)
                    text += `${answer.telephone}\n\n`;
                if (text.length > 0)
                    context.reply(text.trim());
            }
        }
        else if (searchResponse.places && searchResponse.places.value.length > 0) {
            // send reply as response
            for (let answer of searchResponse.places.value) {
                let text = '';
                if (answer.name)
                    text += `**${answer.name}**\n\n`;
                if (answer.address.addressLocality) {
                    let neighborhood = '';
                    if (answer.address.neighborhood.length > 0)
                        neighborhood = `(${answer.address.neighborhood})`;
                    text += `${answer.address.addressLocality}${neighborhood}, ${answer.address.addressRegion} ${answer.address.postalCode}\n\n`;
                }
                if (answer.telephone)
                    text += `${answer.telephone}\n\n`;
                if (text.length > 0)
                    context.reply(text.trim());
            }
        }
        else {
            context.reply("I'm sorry, I didn't find any results.");
        }
    }
    else if (matchResults.searchError) {
        context.reply("I'm sorry, I can't help you because I don't have internet connectivity at the moment.");
    }
}
//# sourceMappingURL=bingEntitySearch.js.map