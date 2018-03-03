[Bot Builder SDK](../README.md) > [PaymentDetails](../interfaces/botbuilder.paymentdetails.md)



# Interface: PaymentDetails

*__interface__*: An interface representing PaymentDetails. Provides information about the requested transaction



## Properties
<a id="displayitems"></a>

###  displayItems

**●  displayItems**:  *[PaymentItem](botbuilder.paymentitem.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1359](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botframework-schema/lib/index.d.ts#L1359)*


*__member__*: {PaymentItem[]} [displayItems] Contains line items for the payment request that the user agent may display





___

<a id="error"></a>

###  error

**●  error**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1373](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botframework-schema/lib/index.d.ts#L1373)*


*__member__*: {string} [error] Error description





___

<a id="modifiers"></a>

###  modifiers

**●  modifiers**:  *[PaymentDetailsModifier](botbuilder.paymentdetailsmodifier.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1369](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botframework-schema/lib/index.d.ts#L1369)*


*__member__*: {PaymentDetailsModifier[]} [modifiers] Contains modifiers for particular payment method identifiers





___

<a id="shippingoptions"></a>

###  shippingOptions

**●  shippingOptions**:  *[PaymentShippingOption](botbuilder.paymentshippingoption.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1364](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botframework-schema/lib/index.d.ts#L1364)*


*__member__*: {PaymentShippingOption[]} [shippingOptions] A sequence containing the different shipping options for the user to choose from





___

<a id="total"></a>

###  total

**●  total**:  *[PaymentItem](botbuilder.paymentitem.md)* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1354](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botframework-schema/lib/index.d.ts#L1354)*


*__member__*: {PaymentItem} [total] Contains the total amount of the payment request





___


