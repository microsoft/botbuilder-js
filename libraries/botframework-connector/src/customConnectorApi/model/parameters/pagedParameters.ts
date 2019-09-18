import { ConversationParameters } from "./conversationParameters";

/**
 * Optional Parameters.
 */
export class PagedParameters extends ConversationParameters {
    /**
     * Suggested page size
     */
    'pageSize': number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "pageSize",
            "baseName": "pageSize",
            "type": "number"
        }    
    ];

    static getAttributeTypeMap() {
        return (super.attributeTypeMap).concat(this.attributeTypeMap);
    }
  }