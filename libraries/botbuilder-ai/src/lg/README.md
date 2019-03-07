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
    npm i
```

Then 
```
    import {TemplateEngine} from 'botbuilder-ai';
    let engine = TemplateEngine.FromFile("lgfilePath");
    let evaled = engine.EvaluateTemplate("templateId", {name:"your options"});
```

to get result

### How to test
```
    npm test
```
