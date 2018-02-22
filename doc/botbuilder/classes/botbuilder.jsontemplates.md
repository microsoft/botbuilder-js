[Bot Builder SDK - Core](../README.md) > [JsonTemplates](../classes/botbuilder.jsontemplates.md)



# Class: JsonTemplates


Template source for rendering dynamic JSON objects. To use add to the pipeline bot .use(new JsonTemplateEngine() .add('templateId', function()=>{} ))

## Implements

* [TemplateRenderer](../interfaces/botbuilder.templaterenderer.md)
* [Middleware](../interfaces/botbuilder.middleware.md)

## Index

### Methods

* [add](botbuilder.jsontemplates.md#add)
* [addFunction](botbuilder.jsontemplates.md#addfunction)
* [contextCreated](botbuilder.jsontemplates.md#contextcreated)
* [postProcess](botbuilder.jsontemplates.md#postprocess)
* [render](botbuilder.jsontemplates.md#render)
* [renderAsJSON](botbuilder.jsontemplates.md#renderasjson)
* [renderTemplate](botbuilder.jsontemplates.md#rendertemplate)
* [compile](botbuilder.jsontemplates.md#compile)



---
## Methods
<a id="add"></a>

###  add

► **add**(name: *`string`*, json: *`string`⎮`any`*): `this`



*Defined in [libraries/botbuilder/lib/jsonTemplates.d.ts:40](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/jsonTemplates.d.ts#L40)*



Registers a new JSON template. The template will be compiled and cached.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  Name of the template to register. |
| json | `string`⎮`any`   |  JSON template. |





**Returns:** `this`





___

<a id="addfunction"></a>

###  addFunction

► **addFunction**(name: *`string`*, fn: *[TemplateFunction](../#templatefunction)*): `this`



*Defined in [libraries/botbuilder/lib/jsonTemplates.d.ts:47](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/jsonTemplates.d.ts#L47)*



Registers a named function that can be called within a template.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  Name of the function to register. |
| fn | [TemplateFunction](../#templatefunction)   |  Function to register. |





**Returns:** `this`





___

<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/jsonTemplates.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/jsonTemplates.d.ts#L32)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="postprocess"></a>

###  postProcess

► **postProcess**(object: *`any`*): `any`



*Defined in [libraries/botbuilder/lib/jsonTemplates.d.ts:70](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/jsonTemplates.d.ts#L70)*



Post processes a JSON object by walking the object and evaluating any processing directives like @prune.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| object | `any`   |  Object to post process. |





**Returns:** `any`





___

<a id="render"></a>

###  render

► **render**(name: *`string`*, data: *`Object`*): `string`⎮`undefined`



*Defined in [libraries/botbuilder/lib/jsonTemplates.d.ts:54](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/jsonTemplates.d.ts#L54)*



Renders a registered JSON template to a string using the given data object.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  Name of the registered template to render. |
| data | `Object`   |  Data object to render template against. |





**Returns:** `string`⎮`undefined`





___

<a id="renderasjson"></a>

###  renderAsJSON

► **renderAsJSON**(name: *`string`*, data: *`Object`*, postProcess?: *`undefined`⎮`true`⎮`false`*): `any`



*Defined in [libraries/botbuilder/lib/jsonTemplates.d.ts:64](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/jsonTemplates.d.ts#L64)*



Renders a registered JSON template using the given data object. The rendered string will be `JSON.parsed()` into a JSON object prior to returning.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  Name of the registered template to render. |
| data | `Object`   |  Data object to render template against. |
| postProcess | `undefined`⎮`true`⎮`false`   |  (Optional) if `true` the rendered output object will be scanned lookingfor any processing directives, such as @prune. The default value is `true`. |





**Returns:** `any`





___

<a id="rendertemplate"></a>

###  renderTemplate

► **renderTemplate**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, language: *`string`*, templateId: *`string`*, data: *`any`*): `Promise`.<[Partial]()[Activity](../interfaces/botbuilder.activity.md)⎮`string`⎮`undefined`>



*Implementation of [TemplateRenderer](../interfaces/botbuilder.templaterenderer.md).[renderTemplate](../interfaces/botbuilder.templaterenderer.md#rendertemplate)*

*Defined in [libraries/botbuilder/lib/jsonTemplates.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/jsonTemplates.d.ts#L33)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| language | `string`   |  - |
| templateId | `string`   |  - |
| data | `any`   |  - |





**Returns:** `Promise`.<[Partial]()[Activity](../interfaces/botbuilder.activity.md)⎮`string`⎮`undefined`>





___

<a id="compile"></a>

### «Static» compile

► **compile**(json: *`string`⎮`any`*, templates?: *[TemplateFunctionMap](../#templatefunctionmap)*): [TemplateFunction](../#templatefunction)



*Defined in [libraries/botbuilder/lib/jsonTemplates.d.ts:79](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/jsonTemplates.d.ts#L79)*



Compiles a JSON template into a function that can be called to render a JSON object using a data object.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| json | `string`⎮`any`   |  The JSON template to compile. |
| templates | [TemplateFunctionMap](../#templatefunctionmap)   |  (Optional) map of template functions (and other compiled templates) thatcan be called at render time. |





**Returns:** [TemplateFunction](../#templatefunction)





___


