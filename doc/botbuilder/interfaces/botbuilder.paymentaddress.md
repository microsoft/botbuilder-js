[Bot Builder SDK - Core](../README.md) > [PaymentAddress](../interfaces/botbuilder.paymentaddress.md)



# Interface: PaymentAddress

*__interface__*: An interface representing PaymentAddress. Address within a Payment Request



## Properties
<a id="addressline"></a>

###  addressLine

**●  addressLine**:  *`string`[]* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1194*


*__member__*: {string[]} [addressLine] This is the most specific part of the address. It can include, for example, a street name, a house number, apartment number, a rural delivery route, descriptive instructions, or a post office box number.





___

<a id="city"></a>

###  city

**●  city**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1204*


*__member__*: {string} [city] This is the city/town portion of the address.





___

<a id="country"></a>

###  country

**●  country**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1187*


*__member__*: {string} [country] This is the CLDR (Common Locale Data Repository) region code. For example, US, GB, CN, or JP





___

<a id="dependentlocality"></a>

###  dependentLocality

**●  dependentLocality**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1210*


*__member__*: {string} [dependentLocality] This is the dependent locality or sublocality within a city. For example, used for neighborhoods, boroughs, districts, or UK dependent localities.





___

<a id="languagecode"></a>

###  languageCode

**●  languageCode**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1226*


*__member__*: {string} [languageCode] This is the BCP-47 language code for the address. It's used to determine the field separators and the order of fields when formatting the address for display.





___

<a id="organization"></a>

###  organization

**●  organization**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1231*


*__member__*: {string} [organization] This is the organization, firm, company, or institution at this address.





___

<a id="phone"></a>

###  phone

**●  phone**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1241*


*__member__*: {string} [phone] This is the phone number of the recipient or contact person.





___

<a id="postalcode"></a>

###  postalCode

**●  postalCode**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1215*


*__member__*: {string} [postalCode] This is the postal code or ZIP code, also known as PIN code in India.





___

<a id="recipient"></a>

###  recipient

**●  recipient**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1236*


*__member__*: {string} [recipient] This is the name of the recipient or contact person.





___

<a id="region"></a>

###  region

**●  region**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1200*


*__member__*: {string} [region] This is the top level administrative subdivision of the country. For example, this can be a state, a province, an oblast, or a prefecture.





___

<a id="sortingcode"></a>

###  sortingCode

**●  sortingCode**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:1220*


*__member__*: {string} [sortingCode] This is the sorting code as used in, for example, France.





___


