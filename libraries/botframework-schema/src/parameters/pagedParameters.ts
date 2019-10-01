import { RequestOptions } from "./requestOptions";

/**
 * Optional Parameters.
 */
export class PagedParameters extends RequestOptions {
    /**
     * Suggested page size
     */
    'pageSize'?: number;
    'continuationToken'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "pageSize",
            "baseName": "pageSize",
            "type": "number"
        },    
        {
            "name": "continuationToken",
            "baseName": "continuationToken",
            "type": "string"
        }    
    ];

    static getAttributeTypeMap() {
        return (super.attributeTypeMap).concat(this.attributeTypeMap);
    }
  }