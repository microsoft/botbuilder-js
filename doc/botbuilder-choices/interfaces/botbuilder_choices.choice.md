[Bot Builder SDK - Choices](../README.md) > [Choice](../interfaces/botbuilder_choices.choice.md)



# Interface: Choice


:package: **botbuilder-choices**

An instance of a choice that can be used to render a choice to a user or recognize something a user picked.

The [value](#value) will be rendered to a user unless an [action](#action) is provided in which case the actions `title` will be rendered to the user.

At recognition time the `value` will always be what gets returned by `findChoices()` and `recognizeChoices()`. By default, the users utterance will be compared against all of the strings provided in the choice. You can disable using the `value` and/or `action.title` during recognition using the `FindChoicesOptions` structure.

**Usage Example**

    const choice = {
        value: 'red',
        action: {
            type: 'imBack',
            title: 'The Red Pill',
            value: 'red pill'
        },
        synonyms: ['crimson', 'scarlet', 'ruby', 'cherry']
    };


## Properties
<a id="action"></a>

### «Optional» action

**●  action**:  *`CardAction`* 

*Defined in [libraries/botbuilder-choices/lib/findChoices.d.ts:50](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findChoices.d.ts#L50)*



(Optional) action to use when rendering the choice as a suggested action. This **MUST** be a complete action containing `type`, `title`, and `value` fields. If not specified an `imBack` action will be generated based on the choices [value](#value) field.




___

<a id="synonyms"></a>

### «Optional» synonyms

**●  synonyms**:  *`string`[]* 

*Defined in [libraries/botbuilder-choices/lib/findChoices.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findChoices.d.ts#L55)*



(Optional) list of synonyms to recognize in addition to the [value](#value) and [action](#action) fields.




___

<a id="value"></a>

###  value

**●  value**:  *`string`* 

*Defined in [libraries/botbuilder-choices/lib/findChoices.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findChoices.d.ts#L44)*



Value to return when recognized by `findChoices()`. Will also be used to render choices to the user if no [action](#action) is provided.




___


