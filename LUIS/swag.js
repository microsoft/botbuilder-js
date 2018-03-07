const swagger = require('./swagger');
const fs = require('fs-extra');
const cc = require('camelcase');
const classTpl = (cfg) => {
    return `const {ServiceBase} = require('../serviceBase');
class ${cfg.className} extends ServiceBase {
    constructor() {
        super('${cfg.url}');
    }
${operationTpl(cfg.operations)}
}
module.exports = ${cfg.className};
`;
};

const operationTpl = (operations) => {
    let tpl = '';
    Object.keys(operations).forEach(key => {
        const operation = operations[key];
        tpl += `
    /**
    * ${operation.description}
    */
    async ${operation.name}(params${operation.entityName ? ` , ${operation.entityName}` : ''}${(operation.entityType ? `/* ${operation.entityType} */` : '')}) {
        return this.createRequest('${operation.pathFragment}', params, '${operation.method}'${operation.entityName ? ', ' + operation.entityName : ''});
    }`;
    });
    return tpl;
};

const modelTpl = (modelCfg) => `
${modelCfg.imports.toString().replace(/[,]/g, '')}
class ${modelCfg.className} {
    ${modelCfg.docBlocks.toString().replace(/[,]/g, '')}
    
    constructor({${modelCfg.props}} = {}) {
        Object.assign(this, {${modelCfg.props}});
    }
}
${modelCfg.className}.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(${modelCfg.className}.fromJSON);
    }
    ${modelCfg.assignments.toString().replace(/[,]/g, '')}
    const {${modelCfg.props}} = source;
    return new ${modelCfg.className}({${modelCfg.props}});
};

module.exports = ${modelCfg.className};
`;

const propertyDocBlockTpl = (type, name) => `
    /**
    * @property {${type}} ${name}
    */
`;

const assignmentTpl = (rawType, name) => `
    source.${name} = ${rawType}.fromJSON(source.${name}) || undefined;
`;

function findEntity(swaggerOperation) {
    return (swaggerOperation.parameters || []).find(param => param.in === 'body');
}

function getMethodAlias(swaggerOperation, method) {
    const {parameters = []} = swaggerOperation;
    if (method !== 'get') {
        return method;
    }
    const hasSkipOrTake = !!parameters.find(param => /(skip|take)/.test(param.name));
    return hasSkipOrTake ? 'list' : method;
}

function findRootAndNodeFromPathName(pathName) {
    const parts = pathName.split('/');
    let i = parts.length;
    const info = {};

    while (i--) {
        if (parts[i] && !/({[\w]+})/.test(parts[i])) {
            info.node = parts[i];
            break;
        }
    }

    while (i--) {
        if (parts[i] && /({versionId}|{appId})/i.test(parts[i]) && parts[i + 1]) {
            info.root = parts[i + 1];
            break;
        }
    }
    return info;
}

const modelTypesByName = {};
Object.keys(swagger.definitions).forEach(key => {
    const def = swagger.definitions[key];
    const {properties, items} = def;
    if (items) {
        console.log(def);
    }
    if (properties) {
        const importsMap = {};
        const model = {className: key, imports: [], props: [], assignments: [], docBlocks: []};
        Object.keys(properties).forEach(propName => {
            const propDetails = properties[propName];
            const name = cc(propName);
            let type;
            if (propDetails.type === 'object') {
                type = propDetails.$ref.split('/').pop();
                model.imports.push(`const ${type} = require('./${name}');`);
                model.assignments.push(assignmentTpl(type, name));
            } else if (propDetails.type === 'array') {
                const $ref = (propDetails.items.$ref || '').split('/').pop() || propDetails.items.type;
                type = `${$ref}[]`;
                if (!/^(string|integer|number|boolean)$/.test($ref) && !importsMap[$ref]) {
                    model.imports.push(`const ${$ref} = require('./${cc($ref)}');\n`);
                    model.assignments.push(assignmentTpl($ref, name));
                    importsMap[$ref] = true;
                }
            } else {
                type = propDetails.type;
            }
            model.docBlocks.push(propertyDocBlockTpl(type, name));
            model.props.push(`${name} /* ${type} */`);
        });
        modelTypesByName[`#/definitions/${key}`] = model;
    }
});
const configsMap = {};
Object.keys(swagger.paths).sort().forEach(pathName => {
    const {root, node} = findRootAndNodeFromPathName(pathName);
    const fileName = root || node;
    const pathFragment = pathName.substr(pathName.indexOf(fileName) + fileName.length);
    const {[pathName]: path} = swagger.paths;
    const keys = Object.keys(path);
    let i = keys.length;
    while (i--) {
        const method = keys[i];
        const {[method]: swaggerOperation} = path;
        // bail, we're deprecated.
        if (swaggerOperation.description.toLowerCase().includes('deprecated')) {
            continue;
        }
        // Get the category from the operationId. pull out "apps" from "apps - Get applications list"
        const category = swaggerOperation.operationId.replace(/(')/g, '').split('-')[0].trim();
        const className = fileName.replace(/[\w]/, match => match.toUpperCase());
        const configKey = `${category}/${fileName}`;
        if (!configsMap[category]) {
            configsMap[category] = {};
        }
        const cfg = configsMap[category][fileName] || {className, category, url: pathName, operations: {}};
        const methodAlias = getMethodAlias(swaggerOperation, method);
        const params = (swaggerOperation.parameters || []).filter(param => (!/(body)/.test(param.in) && (category === 'apps' || !/(appId|versionId)/.test(param.name))));
        const entityToConsume = findEntity(swaggerOperation) || {name: '', schema: {$ref: ''}};
        let command = `${category} ${methodAlias}`;
        if (fileName !== category) {
            command += ` ${fileName}`;
        }
        if (root && root !== node) {
            command += ` ${node} `;
        }
        command += entityToConsume.name ? ` --in ${entityToConsume.name}.json ` : '';
        command += params.reduce((agg, param) => (agg += ` --${param.name} <${param.type}>`), '');

        const operation = {
            method,
            methodAlias,
            command,
            pathFragment,
            params,
            description: swaggerOperation.description,
        };
        if (!operation.params.length) {
            delete operation.params;
        }
        if (!entityToConsume.schema.$ref && entityToConsume.schema.example) {
            const entity = JSON.parse(entityToConsume.schema.example);
            // console.log('no entity for: ', entity, pathName);
        }
        operation.name = swaggerOperation.operationId
            .replace(/(')/g, '')
            .split('-')
            .pop()
            .replace(/( \w)/g, (...args) => args[2] ? args[0]
                .trim()
                .toUpperCase() : args[0]
                .trim()
                .toLowerCase());

        if (entityToConsume.name) {
            operation.entityName = entityToConsume.name;
            operation.entityType = (entityToConsume.schema.$ref || '').split('/').pop();
        }
        let operationKey = operation.methodAlias;
        if (root && root !== node) {
            operationKey += `:${node}`;
        }
        operationKey += `:${operation.name.trim()}`;
        cfg.operations[operationKey] = operation;
        configsMap[category][fileName] = cfg;
    }
});

let classNames = {};
Object.keys(configsMap).forEach(category => {
    const cfg = configsMap[category];
    Object.keys(cfg).forEach(fileName => {
        const clazz = classTpl(cfg[fileName]);
        const path = `${category}/${fileName}`;
        fs.outputFileSync(`generated/${path}.js`, clazz);
        (classNames[cfg.category] || (classNames[cfg.category] = [])).push({path, name: cfg[fileName].className});
    });
});

let apiIndexJs = '';
Object.keys(classNames).forEach(category => {
    const names = classNames[category];
    const serviceIndexJS = names.map(info => `module.exports.${info.name} = require('./${info.name.toLowerCase()}');`).join('\n');
    apiIndexJs += `module.exports.${category} = require('./${category}');\n`;
    fs.outputFileSync(`generated/${category}/index.js`, serviceIndexJS);
});
fs.outputFileSync('generated/index.js', apiIndexJs);

let modelNames = [];
Object.keys(modelTypesByName).forEach(key => {
    const modelCfg = modelTypesByName[key];
    const model = modelTpl(modelCfg);
    fs.outputFileSync(`generated/dataModels/${cc(modelCfg.className)}.js`, model);
    modelNames.push(modelCfg.className);
});

const modelIndexJS = modelNames.sort().map(clazz => `module.exports.${clazz} = require('./${cc(clazz)}');`).join('\n');

fs.outputFileSync('generated/dataModels/index.js', modelIndexJS);
fs.writeJsonSync('generated/manifest.json', configsMap);