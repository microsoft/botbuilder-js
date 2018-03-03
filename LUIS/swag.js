const swagger = require('./swagger');
const fs = require('fs-extra');
const cc = require('camelcase');

const classTpl = (cfg) => {
    return `const {ServiceBase} = require('./serviceBase');
class ${cfg.className} extends ServiceBase {
    constructor() {
        super('${cfg.url}');
    }
${operationTpl(cfg.operations)}
}
module.exports = {${cfg.className}};
`;
};

const operationTpl = (operations) => {
    let tpl = '';
    operations.forEach(operation => {
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

module.exports = {${modelCfg.className}};
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

function findFileNameFromPathName(pathName) {
    const parts = pathName.split('/');
    let i = parts.length;
    while (i--) {
        if (parts[i] && /({versionId}|{appId})/i.test(parts[i]) && parts[i + 1]) {
            return parts[i + 1];
        }
    }

    // Fallback - we're not likely to get to this point often.
    i = parts.length;
    while (i--) {
        if (parts[i] && !/({[\w]+})/.test(parts[i])) {
            return parts[i];
        }
    }
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
const configsByFileName = {};
Object.keys(swagger.paths).forEach(pathName => {
    const fileName = findFileNameFromPathName(pathName);
    const pathFragment = pathName.substr(pathName.indexOf(fileName) + fileName.length);
    const {[pathName]: path} = swagger.paths;
    const className = fileName.replace(/[\w]/, match => match.toUpperCase());
    const cfg = configsByFileName[fileName] || {className, url: pathName, operations: []};
    const keys = Object.keys(path);
    let i = keys.length;
    while (i--) {
        const operationName = keys[i];
        const {[operationName]: swaggerOperation} = path;
        if (swaggerOperation.description.toLowerCase().includes('deprecated')) {
            continue;
        }
        const operation = {
            description: swaggerOperation.description,
            pathFragment,
            params: (swaggerOperation.parameters || []).filter(param => (!/(body|query)/.test(param.in) && !/(appId|versionId)/.test(param.name)))
        };
        const entityToConsume = findEntity(swaggerOperation) || {name: '', schema: {$ref: ''}};
        if (!entityToConsume.schema.$ref && entityToConsume.schema.example) {
            const entity = JSON.parse(entityToConsume.schema.example);
            console.log('no entity for: ', entity, pathName);
        }
        operation.method = operationName;
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
        cfg.operations.push(operation);
    }
    if (cfg.operations.length) {
        configsByFileName[fileName] = cfg;
    }
});

let classNames = [];
Object.keys(configsByFileName).forEach(key => {
    const cfg = configsByFileName[key];
    const clazz = classTpl(cfg);
    fs.ensureDir('generated').then(() => fs.writeFileSync(`generated/${key}.js`, clazz));
    classNames.push(cfg.className);
});

let modelNames = [];
Object.keys(modelTypesByName).forEach(key => {
    const modelCfg = modelTypesByName[key];
    const model = modelTpl(modelCfg);
    fs.ensureDir('generated/models').then(() => fs.writeFileSync(`generated/models/${cc(modelCfg.className)}.js`, model));
    modelNames.push(modelCfg.className);
});

const modelIndexJS = modelNames.sort().map(clazz => `module.exports.${clazz} = require('./${cc(clazz)}').${clazz};`).join('\n');
fs.writeFileSync('generated/models/index.js', modelIndexJS);
const serviceIndexJS = classNames.sort().map(clazz => `module.exports.${clazz} = require('./${cc(clazz)}').${clazz};`).join('\n');
fs.writeFileSync('generated/index.js', serviceIndexJS);
fs.writeJsonSync('generated/manifest.json', configsByFileName);