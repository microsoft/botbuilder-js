[Bot Builder SDK - Core](../README.md) > [PaymentDetailsModifier](../interfaces/botbuilder.paymentdetailsmodifier.md)



# Interface: PaymentDetailsModifier

*__interface__*: An interface representing PaymentDetailsModifier. Provides details that modify the PaymentDetails based on payment method identifier



## Properties
<a id="additionaldisplayitems"></a>

###  additionalDisplayItems

**●  additionalDisplayItems**:  *[PaymentItem](botbuilder.paymentitem.md)[]* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1336*


*__member__*: {PaymentItem[]} [additionalDisplayItems] Provides additional display items that are appended to the displayItems field in the PaymentDetails dictionary for the payment method identifiers in the supportedMethods field





___

<a id="data"></a>

###  data

**●  data**:  *`any`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1341*


*__member__*: {any} [data] A JSON-serializable object that provides optional information that might be needed by the supported payment methods





___

<a id="supportedmethods"></a>

###  supportedMethods

**●  supportedMethods**:  *`string`[]* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1323*


*__member__*: {string[]} [supportedMethods] Contains a sequence of payment method identifiers





___

<a id="total"></a>

###  total

**●  total**:  *[PaymentItem](botbuilder.paymentitem.md)* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1329*


*__member__*: {PaymentItem} [total] This value overrides the total field in the PaymentDetails dictionary for the payment method identifiers in the supportedMethods field





___


