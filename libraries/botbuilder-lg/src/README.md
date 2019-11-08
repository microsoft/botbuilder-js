### Introduction
Language Generation tool

### How to use
cd to microsoft-expression directory, then
```
npm i
tsc
```

Then back to botbuilder-ai directory
```
    yarn install
```

Then 
```
    import {TemplateEngine} from 'botbuilder-ai';
    let engine = TemplateEngine.fromFiles("lgfilePath");
    let evaled = engine.evaluateTemplate("templateId", {name:"your options"});
```

to get result

### How to test
```
    npm test
```
