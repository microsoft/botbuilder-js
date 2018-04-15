[Bot Builder SDK](../README.md) > [PaymentAddress](../interfaces/botbuilder.paymentaddress.md)



# Interface: PaymentAddress

*__interface__*: An interface representing PaymentAddress. Address within a Payment Request



## Properties
<a id="addressline"></a>

###  addressLine

**●  addressLine**:  *`string`[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1327](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1327)*


*__member__*: {string[]} [addressLine] This is the most specific part of the address. It can include, for example, a street name, a house number, apartment number, a rural delivery route, descriptive instructions, or a post office box number.





___

<a id="city"></a>

###  city

**●  city**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1337](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1337)*


*__member__*: {string} [city] This is the city/town portion of the address.





___

<a id="country"></a>

###  country

**●  country**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1320](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1320)*


*__member__*: {string} [country] This is the CLDR (Common Locale Data Repository) region code. For example, US, GB, CN, or JP





___

<a id="dependentlocality"></a>

###  dependentLocality

**●  dependentLocality**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1343](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1343)*


*__member__*: {string} [dependentLocality] This is the dependent locality or sublocality within a city. For example, used for neighborhoods, boroughs, districts, or UK dependent localities.





___

<a id="languagecode"></a>

###  languageCode

**●  languageCode**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1359](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1359)*


*__member__*: {string} [languageCode] This is the BCP-47 language code for the address. It's used to determine the field separators and the order of fields when formatting the address for display.





___

<a id="organization"></a>

###  organization

**●  organization**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1364](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1364)*


*__member__*: {string} [organization] This is the organization, firm, company, or institution at this address.





___

<a id="phone"></a>

###  phone

**●  phone**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1374](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1374)*


*__member__*: {string} [phone] This is the phone number of the recipient or contact person.





___

<a id="postalcode"></a>

###  postalCode

**●  postalCode**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1348](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1348)*


*__member__*: {string} [postalCode] This is the postal code or ZIP code, also known as PIN code in India.





___

<a id="recipient"></a>

###  recipient

**●  recipient**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1369](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1369)*


*__member__*: {string} [recipient] This is the name of the recipient or contact person.





___

<a id="region"></a>

###  region

**●  region**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1333](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1333)*


*__member__*: {string} [region] This is the top level administrative subdivision of the country. For example, this can be a state, a province, an oblast, or a prefecture.





___

<a id="sortingcode"></a>

###  sortingCode

**●  sortingCode**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:1353](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L1353)*


*__member__*: {string} [sortingCode] This is the sorting code as used in, for example, France.





___


