import { ObjectSerializer } from "./customTokenApi/model";

export class ApiHelper {
async function deserializeResponse<T>(url, requestOptions): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        fetch(url, requestOptions).then(response => {
            let httpResponse: http.IncomingMessage = response;
            response.json().then(result => {
                let _body: T = ObjectSerializer.deserialize(result);
                let _bodyAsText: string = _body == undefined ? '' : ObjectSerializer.deserialize(result);
                let _response = Object.assign(httpResponse, { bodyAsText: _bodyAsText, parsedBody: _body });
                let toReturn: T = _body == undefined ? Object.assign(_body, {}) : Object.assign(_body, _response.parsedBody);

                resolve(toReturn);
            }).catch(err => {
                let toReturn: T = { _error: err } as any
                resolve(toReturn);
            });
        });
    });
}


public static serialize(data: any, type: string) {
    if (data == undefined) {
        return data;
    } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
        return data;
    } else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
        let subType: string = type.replace("Array<", ""); // Array<Type> => Type>
        subType = subType.substring(0, subType.length - 1); // Type> => Type
        let transformedData: any[] = [];
        for (let index in data) {
            let date = data[index];
            transformedData.push(ObjectSerializer.serialize(date, subType));
        }
        return transformedData;
    } else if (type === "Date") {
        return data.toISOString();
    } else {
        if (enumsMap[type]) {
            return data;
        }
        if (!typeMap[type]) { // in case we dont know the type
            return data;
        }
        
        // Get the actual type of this object
        type = this.findCorrectType(data, type);

        // get the map for the correct type.
        let attributeTypes = typeMap[type].getAttributeTypeMap();
        let instance: {[index: string]: any} = {};
        for (let index in attributeTypes) {
            let attributeType = attributeTypes[index];
            instance[attributeType.baseName] = ObjectSerializer.serialize(data[attributeType.name], attributeType.type);
        }
        return instance;
    }
}

public static deserialize(data: any, type: string = '') {
    // polymorphism may change the actual type.
    type = ObjectSerializer.findCorrectType(data, type);
    if (data == undefined) {
        return data;
    } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
        return data;
    } else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
        let subType: string = type.replace("Array<", ""); // Array<Type> => Type>
        subType = subType.substring(0, subType.length - 1); // Type> => Type
        let transformedData: any[] = [];
        for (let index in data) {
            let date = data[index];
            transformedData.push(ObjectSerializer.deserialize(date, subType));
        }
        return transformedData;
    } else if (type === "Date") {
        return new Date(data);
    } else {
        if (enumsMap[type]) {// is Enum
            return data;
        }

        if (!typeMap[type]) { // dont know the type
            return data;
        }
        let instance = new typeMap[type]();
        let attributeTypes = typeMap[type].getAttributeTypeMap();
        for (let index in attributeTypes) {
            let attributeType = attributeTypes[index];
            instance[attributeType.name] = ObjectSerializer.deserialize(data[attributeType.baseName], attributeType.type);
        }
        return instance;
    }
}