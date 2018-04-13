[Bot Builder SDK](../README.md) > [PaymentOptions](../interfaces/botbuilder.paymentoptions.md)



# Interface: PaymentOptions

*__interface__*: An interface representing PaymentOptions. Provides information about the options desired for the payment request



## Properties
<a id="requestpayeremail"></a>

###  requestPayerEmail

**●  requestPayerEmail**:  *`boolean`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1545](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1545)*


*__member__*: {boolean} [requestPayerEmail] Indicates whether the user agent should collect and return the payer's email address as part of the payment request





___

<a id="requestpayername"></a>

###  requestPayerName

**●  requestPayerName**:  *`boolean`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1539](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1539)*


*__member__*: {boolean} [requestPayerName] Indicates whether the user agent should collect and return the payer's name as part of the payment request





___

<a id="requestpayerphone"></a>

###  requestPayerPhone

**●  requestPayerPhone**:  *`boolean`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1551](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1551)*


*__member__*: {boolean} [requestPayerPhone] Indicates whether the user agent should collect and return the payer's phone number as part of the payment request





___

<a id="requestshipping"></a>

###  requestShipping

**●  requestShipping**:  *`boolean`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1557](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1557)*


*__member__*: {boolean} [requestShipping] Indicates whether the user agent should collect and return a shipping address as part of the payment request





___

<a id="shippingtype"></a>

###  shippingType

**●  shippingType**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1563](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1563)*


*__member__*: {string} [shippingType] If requestShipping is set to true, then the shippingType field may be used to influence the way the user agent presents the user interface for gathering the shipping address





___


