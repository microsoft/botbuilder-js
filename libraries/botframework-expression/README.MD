### Introduction
Expression migrated from C# version(https://github.com/Microsoft/botbuilder-dotnet/tree/ComposableDialog/libraries/Microsoft.CommonExpressions)

### How to use
```
    npm i
```
Then 
```
    var parsed = ExpressionEngine.Parse(input);
    var actual = ExpressionEngine.Evaluate(parsed, scope);
```

to get result

### How to test
```
    npm test
```
