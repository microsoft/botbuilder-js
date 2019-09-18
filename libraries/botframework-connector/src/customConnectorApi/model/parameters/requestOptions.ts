export class RequestOptions {
    'headers':
    {
        [name: string]: string
    }

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "headers",
            "baseName": "headers",
            "type": "{ [name: string]: string }"
        }    
    ];

    static getAttributeTypeMap() {
        return this.attributeTypeMap;
    }
}