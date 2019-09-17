/**
 * Microsoft Bot Connector API - v3.0
 * The Bot Connector REST API allows your bot to send and receive messages to channels configured in the  [Bot Framework Developer Portal](https://dev.botframework.com). The Connector service uses industry-standard REST  and JSON over HTTPS.    Client libraries for this REST API are available. See below for a list.    Many bots will use both the Bot Connector REST API and the associated [Bot State REST API](/en-us/restapi/state). The  Bot State REST API allows a bot to store and retrieve state associated with users and conversations.    Authentication for both the Bot Connector and Bot State REST APIs is accomplished with JWT Bearer tokens, and is  described in detail in the [Connector Authentication](/en-us/restapi/authentication) document.    # Client Libraries for the Bot Connector REST API    * [Bot Builder for C#](/en-us/csharp/builder/sdkreference/)  * [Bot Builder for Node.js](/en-us/node/builder/overview/)  * Generate your own from the [Connector API Swagger file](https://raw.githubusercontent.com/Microsoft/BotBuilder/master/CSharp/Library/Microsoft.Bot.Connector.Shared/Swagger/ConnectorAPI.json)    © 2016 Microsoft
 *
 * The version of the OpenAPI document: v3
 * Contact: botframework@microsoft.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { CardAction } from './cardAction';
import { CardImage } from './cardImage';

/**
* A Hero card (card with a single, large image)
*/
export class HeroCard {
    /**
    * Title of the card
    */
    'title'?: string;
    /**
    * Subtitle of the card
    */
    'subtitle'?: string;
    /**
    * Text for the card
    */
    'text'?: string;
    /**
    * Array of images for the card
    */
    'images'?: Array<CardImage>;
    /**
    * Set of actions applicable to the current card
    */
    'buttons'?: Array<CardAction>;
    'tap'?: CardAction;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "title",
            "baseName": "title",
            "type": "string"
        },
        {
            "name": "subtitle",
            "baseName": "subtitle",
            "type": "string"
        },
        {
            "name": "text",
            "baseName": "text",
            "type": "string"
        },
        {
            "name": "images",
            "baseName": "images",
            "type": "Array<CardImage>"
        },
        {
            "name": "buttons",
            "baseName": "buttons",
            "type": "Array<CardAction>"
        },
        {
            "name": "tap",
            "baseName": "tap",
            "type": "CardAction"
        }    ];

    static getAttributeTypeMap() {
        return HeroCard.attributeTypeMap;
    }
}

