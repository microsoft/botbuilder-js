# Bot Framework Bot Configuration library
This library provides the ability to read/write Bot Framework .bot files.

## Usage

```typescript
import * as bfc from 'botframework-config';

// load and decrypt .bot file
let configuration = bfc.BotConfiguration.load('my.bot', mysecret);
...

// save .bot file encrypted with secret
configuration.save('my.bot', mysecret);
```

