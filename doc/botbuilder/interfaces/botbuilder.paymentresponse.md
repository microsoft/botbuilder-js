[Bot Builder SDK](../README.md) > [PaymentResponse](../interfaces/botbuilder.paymentresponse.md)



# Interface: PaymentResponse

*__interface__*: An interface representing PaymentResponse. A PaymentResponse is returned when a user has selected a payment method and approved a payment request



## Properties
<a id="details"></a>

###  details

**●  details**:  *`any`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1614](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1614)*


*__member__*: {any} [details] A JSON-serializable object that provides a payment method specific message used by the merchant to process the transaction and determine successful fund transfer





___

<a id="methodname"></a>

###  methodName

**●  methodName**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1608](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1608)*


*__member__*: {string} [methodName] The payment method identifier for the payment method that the user selected to fulfil the transaction





___

<a id="payeremail"></a>

###  payerEmail

**●  payerEmail**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1633](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1633)*


*__member__*: {string} [payerEmail] If the requestPayerEmail flag was set to true in the PaymentOptions passed to the PaymentRequest constructor, then payerEmail will be the email address chosen by the user





___

<a id="payerphone"></a>

###  payerPhone

**●  payerPhone**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1639](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1639)*


*__member__*: {string} [payerPhone] If the requestPayerPhone flag was set to true in the PaymentOptions passed to the PaymentRequest constructor, then payerPhone will be the phone number chosen by the user





___

<a id="shippingaddress"></a>

###  shippingAddress

**●  shippingAddress**:  *[PaymentAddress](botbuilder.paymentaddress.md)* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1621](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1621)*


*__member__*: {PaymentAddress} [shippingAddress] If the requestShipping flag was set to true in the PaymentOptions passed to the PaymentRequest constructor, then shippingAddress will be the full and final shipping address chosen by the user





___

<a id="shippingoption"></a>

###  shippingOption

**●  shippingOption**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1627](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1627)*


*__member__*: {string} [shippingOption] If the requestShipping flag was set to true in the PaymentOptions passed to the PaymentRequest constructor, then shippingOption will be the id attribute of the selected shipping option





___


