[Bot Builder SDK - Choices](../README.md) > [SortedValue](../interfaces/botbuilder_choices.sortedvalue.md)



# Interface: SortedValue


:package: **botbuilder-choices**

INTERNAL: A value that can be sorted and still refer to its original position within a source array. The `findChoices()` function expands the passed in choices to individual `SortedValue` instances and passes them to `findValues()`. Each individual `Choice` can result in multiple synonyms that should be searched for so this data structure lets us pass each synonym as a value to search while maintaining the index of the choice that value came from.


## Properties
<a id="index"></a>

###  index

**●  index**:  *`number`* 

*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:70](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findValues.d.ts#L70)*



The values original position within its unsorted array.




___

<a id="value"></a>

###  value

**●  value**:  *`string`* 

*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findValues.d.ts#L68)*



The value that will be sorted.




___


