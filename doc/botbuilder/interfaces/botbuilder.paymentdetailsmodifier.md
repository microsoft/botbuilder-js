[Bot Builder SDK](../README.md) > [PaymentDetailsModifier](../interfaces/botbuilder.paymentdetailsmodifier.md)



# Interface: PaymentDetailsModifier

*__interface__*: An interface representing PaymentDetailsModifier. Provides details that modify the PaymentDetails based on payment method identifier



## Properties
<a id="additionaldisplayitems"></a>

###  additionalDisplayItems

**●  additionalDisplayItems**:  *[PaymentItem](botbuilder.paymentitem.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1469](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1469)*


*__member__*: {PaymentItem[]} [additionalDisplayItems] Provides additional display items that are appended to the displayItems field in the PaymentDetails dictionary for the payment method identifiers in the supportedMethods field





___

<a id="data"></a>

###  data

**●  data**:  *`any`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1474](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1474)*


*__member__*: {any} [data] A JSON-serializable object that provides optional information that might be needed by the supported payment methods





___

<a id="supportedmethods"></a>

###  supportedMethods

**●  supportedMethods**:  *`string`[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1456](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1456)*


*__member__*: {string[]} [supportedMethods] Contains a sequence of payment method identifiers





___

<a id="total"></a>

###  total

**●  total**:  *[PaymentItem](botbuilder.paymentitem.md)* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1462](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1462)*


*__member__*: {PaymentItem} [total] This value overrides the total field in the PaymentDetails dictionary for the payment method identifiers in the supportedMethods field





___


