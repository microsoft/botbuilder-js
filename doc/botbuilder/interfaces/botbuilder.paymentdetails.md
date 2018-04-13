[Bot Builder SDK](../README.md) > [PaymentDetails](../interfaces/botbuilder.paymentdetails.md)



# Interface: PaymentDetails

*__interface__*: An interface representing PaymentDetails. Provides information about the requested transaction



## Properties
<a id="displayitems"></a>

###  displayItems

**●  displayItems**:  *[PaymentItem](botbuilder.paymentitem.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1492](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1492)*


*__member__*: {PaymentItem[]} [displayItems] Contains line items for the payment request that the user agent may display





___

<a id="error"></a>

###  error

**●  error**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1506](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1506)*


*__member__*: {string} [error] Error description





___

<a id="modifiers"></a>

###  modifiers

**●  modifiers**:  *[PaymentDetailsModifier](botbuilder.paymentdetailsmodifier.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1502](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1502)*


*__member__*: {PaymentDetailsModifier[]} [modifiers] Contains modifiers for particular payment method identifiers





___

<a id="shippingoptions"></a>

###  shippingOptions

**●  shippingOptions**:  *[PaymentShippingOption](botbuilder.paymentshippingoption.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1497](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1497)*


*__member__*: {PaymentShippingOption[]} [shippingOptions] A sequence containing the different shipping options for the user to choose from





___

<a id="total"></a>

###  total

**●  total**:  *[PaymentItem](botbuilder.paymentitem.md)* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1487](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1487)*


*__member__*: {PaymentItem} [total] Contains the total amount of the payment request





___


