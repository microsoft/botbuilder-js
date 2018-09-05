const assert = require('assert');
const nock = require('nock');
const {
  LanguageGenerationResolver,
  Utilities,
  PatternRecognizer,
  SlotsBuilder,
  Slot,
  ActivityInjector,
  ActivityInspector,
} = require('../');

const { isEmpty } = require('lodash');

const expect = val => ({
  toBe: comparedVal => assert(val === comparedVal),
  toEqual: comparedVal => assert(val == comparedVal),
  toBeTruthy: () => assert(val == true),
  toBeFalsy: () => assert(val == false),
  toBeUndefined: () => assert(!val),
  toBeDefined: () => assert(val),
});

class CardAction {}

class Activity {
  constructor() {
    this.suggestedAction = {
      actions: [],
    };
  }
}

class SuggestedActions {}

class ActivityBuilder {
  constructor() {
    this.text = null;
    this.speak = null;
    this.cardActions = [];
  }

  setText(text) {
    this.text = text;

    return this;
  }
  setSpeak(speak) {
    this.speak = speak;

    return this;
  }

  addCardAction(cardAction) {
    this.cardActions.push(cardAction);

    return this;
  }

  build() {
    const activity = new Activity();
    activity.text = this.text;
    activity.speak = this.speak;
    activity.suggestedActions = new SuggestedActions();
    activity.suggestedActions.actions = this.cardActions;

    return activity;
  }
}

const examplesPool = {
  multipleReferences1: require('../tests/LGTestData/MultipleReferences1.json'),
  multipleReferences2: require('../tests/LGTestData/MultipleReferences2.json'),
  singleReference1: require('../tests/LGTestData/SingleReference1.json'),
  singleReference2: require('../tests/LGTestData/SingleReference2.json'),
  withEntities: require('../tests/LGTestData/WithEntities.json'),
};

describe('PatternRecognizer', () => {
  it('should extract all template references', () => {
    const templateReferences = PatternRecognizer.extractPatterns(
      '[sayGoodMorning]',
    );

    expect(templateReferences[0]).toEqual('sayGoodMorning');

    const templateReferences1 = PatternRecognizer.extractPatterns(
      '[sayHello], John! [welcomePhrase] to the {new} office.',
    );

    expect(templateReferences1[0]).toEqual('sayHello');
    expect(templateReferences1[1]).toEqual('welcomePhrase');
    expect(templateReferences1.length).toEqual(2);

    const templateReferences2 = PatternRecognizer.extractPatterns(
      '[sayGoodBye], John! [thankingPhrase] for your time, [scheduleMeeting].',
    );
    expect(templateReferences2[0]).toEqual('sayGoodBye');
    expect(templateReferences2[1]).toEqual('thankingPhrase');
    expect(templateReferences2[2]).toEqual('scheduleMeeting');
  });

  it('should return an empty array if no template references are found', () => {
    const templateReferences = PatternRecognizer.extractPatterns(
      'Hello John, welcome to BF!',
    );
    expect(templateReferences.length).toBe(0);
  });

  it('should handle tempelate references with entities included in the reference', () => {
    const templateReferences = PatternRecognizer.extractPatterns(
      '[welcome:{user}]',
    );

    expect(templateReferences[0]).toEqual('welcome:{user}');
  });

  it('should ignore invalid template references', () => {
    const templateReferences = PatternRecognizer.extractPatterns('[welcome]');
    expect(templateReferences[0]).toEqual('welcome\\');
    throw new Error('This should throw');
  });

  it('should replace all template references with their corresponding resolutions', () => {
    const templateReferences = new Map().set('sayGoodMorning', 'Hello');

    const newUtterance = PatternRecognizer.replacePatterns(
      '[sayGoodMorning]',
      templateReferences,
    );

    expect(newUtterance).toEqual('Hello');

    const templateReferences1 = new Map()
      .set('sayHello', 'hello')
      .set('welcomePhrase', 'welcome');

    const newUtterance1 = PatternRecognizer.replacePatterns(
      '[sayHello], John! [welcomePhrase] to the {new} office.',
      templateReferences1,
    );

    expect(newUtterance1).toEqual('hello, John! welcome to the {new} office.');

    const templateReferences2 = new Map()
      .set('sayGoodBye', 'Bye')
      .set('thankingPhrase', 'thanks')
      .set('scheduleMeeting', `let's have a meeting`);

    const newUtterance2 = PatternRecognizer.replacePatterns(
      '[sayGoodBye], John! [thankingPhrase] for your time, [scheduleMeeting].',
      templateReferences2,
    );

    expect(newUtterance2).toEqual(
      `Bye, John! thanks for your time, let's have a meeting.`,
    );
  });

  it('should keep text as is if no template references are found', () => {
    const templateReferences = new Map().set('sayGoodMorning', 'Hello');

    const newUtterance = PatternRecognizer.replacePatterns(
      'Hello John, welcome to BF!',
      templateReferences,
    );

    expect(newUtterance).toEqual('Hello John, welcome to BF!');
  });
});

describe('ActivityUtilities', () => {
  it('should extract all the template references from the given activity and use them to construct the slots array', () => {
    const cardAction = new CardAction();
    cardAction.text = examplesPool.singleReference1.text;
    cardAction.displayText = examplesPool.singleReference2.text;

    const activity = new ActivityBuilder()
      .setText(examplesPool.multipleReferences1.text)
      .setSpeak(examplesPool.multipleReferences2.text)
      .addCardAction(cardAction)
      .build();

    const activityInspector = new ActivityInspector(activity);
    const slots = activityInspector.extractTemplateReferencesSlots();

    expect(slots.length).toBe(7);
    expect(slots.every(slot => !isEmpty(slot.value))).toBeTruthy();
  });

  it('should inject the template resolutions in their respective references in the activity', () => {
    const cardAction = new CardAction();
    cardAction.text = examplesPool.singleReference1.text;
    cardAction.displayText = examplesPool.singleReference2.text;

    const activity = new ActivityBuilder()
      .setText(examplesPool.multipleReferences1.text)
      .setSpeak(examplesPool.multipleReferences2.text)
      .addCardAction(cardAction)
      .build();

    const arr = [
      ...examplesPool.singleReference1.resolutions,
      ...examplesPool.singleReference2.resolutions,
      ...examplesPool.multipleReferences1.resolutions,
      ...examplesPool.multipleReferences2.resolutions,
    ];

    const responsesMap = new Map(arr);

    const activityInjector = new ActivityInjector(activity);

    activityInjector.injectTemplateReferences(responsesMap);

    expect(activity.text).toEqual(
      examplesPool.multipleReferences1.resolvedText,
    );
    expect(activity.speak).toEqual(
      examplesPool.multipleReferences2.resolvedText,
    );
    expect(activity.suggestedActions.actions[0].text).toEqual(
      examplesPool.singleReference1.resolvedText,
    );
    expect(activity.suggestedActions.actions[0].displayText).toEqual(
      examplesPool.singleReference2.resolvedText,
    );
  });
});

describe('Utilities.convertLGValueToString', () => {
  it('should unwrap string LGValue into string', () => {
    const strLGVal = 'LanguageGeneration';
    const strVal = Utilities.convertLGValueToString({
      stringValues: [strLGVal],
      valueType: 0,
    });
    expect(strVal).toEqual(strLGVal + '');
  });

  it('should convert int LGValue to string', () => {
    const integerVal = 10;
    const strVal = Utilities.convertLGValueToString({
      intValues: [integerVal],
      valueType: 1,
    });
    expect(strVal).toEqual(integerVal + '');
  });

  it('should convert float LGValue to string', () => {
    const floatVal = 10.0;
    const strVal = Utilities.convertLGValueToString({
      floatValues: [floatVal],
      valueType: 2,
    });
    expect(strVal).toEqual(floatVal + '');
  });

  it('should convert boolean LGValue to string', () => {
    const booleanVal = false;
    const strVal = Utilities.convertLGValueToString({
      booleanValues: [booleanVal],
      valueType: 3,
    });
    expect(strVal).toEqual(booleanVal + '');
  });

  it('should convert Date LGValue to string', () => {
    const dateVal = new Date().toUTCString();
    const strVal = Utilities.convertLGValueToString({
      dateTimeValues: [dateVal],
      valueType: 4,
    });
    expect(strVal).toEqual(dateVal + '');
  });
});

describe('Utilities.convertSlotToLGValue', () => {
  it('should convert from string to lgVal', () => {
    const val = 'val';
    const lgVal = Utilities.convertSlotToLGValue(new Slot('key', val));
    expect(lgVal.valueType).toEqual(0);
    expect(lgVal.stringValues[0]).toEqual(val);
    expect(lgVal.intValues).toBeUndefined();
    expect(lgVal.floatValues).toBeUndefined();
    expect(lgVal.booleanValues).toBeUndefined();
    expect(lgVal.dateTimeValues).toBeUndefined();
  });

  it('should convert from integer to lgVal', () => {
    const val = 10;
    const lgVal = Utilities.convertSlotToLGValue(new Slot('key', val));
    expect(lgVal.valueType).toEqual(1);
    expect(lgVal.intValues[0]).toEqual(val);
    expect(lgVal.stringValues).toBeUndefined();
    expect(lgVal.floatValues).toBeUndefined();
    expect(lgVal.booleanValues).toBeUndefined();
    expect(lgVal.dateTimeValues).toBeUndefined();
  });

  it('should convert from float to lgVal', () => {
    const val = 10.2;
    const lgVal = Utilities.convertSlotToLGValue(new Slot('key', val));
    expect(lgVal.valueType).toEqual(2);
    expect(lgVal.floatValues[0]).toEqual(val);
    expect(lgVal.stringValues).toBeUndefined();
    expect(lgVal.intValues).toBeUndefined();
    expect(lgVal.booleanValues).toBeUndefined();
    expect(lgVal.dateTimeValues).toBeUndefined();
  });

  it('should convert from boolean to lgVal', () => {
    const val = false;
    const lgVal = Utilities.convertSlotToLGValue(new Slot('key', val));
    expect(lgVal.valueType).toEqual(3);
    expect(lgVal.booleanValues[0]).toEqual(val);
    expect(lgVal.stringValues).toBeUndefined();
    expect(lgVal.intValues).toBeUndefined();
    expect(lgVal.floatValues).toBeUndefined();
    expect(lgVal.dateTimeValues).toBeUndefined();
  });

  it('should convert from Date to lgVal', () => {
    const val = new Date();
    const lgVal = Utilities.convertSlotToLGValue(new Slot('key', val));
    expect(lgVal.valueType).toEqual(4);
    expect(lgVal.dateTimeValues[0]).toEqual(val.toISOString());
    expect(lgVal.stringValues).toBeUndefined();
    expect(lgVal.intValues).toBeUndefined();
    expect(lgVal.floatValues).toBeUndefined();
    expect(lgVal.booleanValues).toBeUndefined();
  });
});

describe('Utilities.extractTemplateReferenceAndResolution', () => {
  it('should extract template reference and resolution from the given LGResonse', () => {
    const lgVal = {
      stringValues: ['hello'],
      valueType: 0,
    };

    const [
      reference,
      resolution,
    ] = Utilities.extractTemplateReferenceAndResolution({
      outputs: {
        sayHello: lgVal,
      },
    });
    expect(reference).toEqual('sayHello');
    expect(resolution).toEqual('hello');
  });
});

describe('SlotsBuilder', () => {
  it('should build template reference slots from given activity', () => {
    const activity = new ActivityBuilder()
      .setText(examplesPool.multipleReferences1.text)
      .setSpeak(examplesPool.multipleReferences2.text)
      .build();

    const slotsBuilder = new SlotsBuilder(activity, new Map());
    const [templateReferencesSlots] = slotsBuilder.build();

    expect(templateReferencesSlots.length).toBe(
      examplesPool.multipleReferences1.resolutions.length +
        examplesPool.multipleReferences2.resolutions.length,
    );

    expect(
      templateReferencesSlots
        .map(slot => slot.key)
        .every(key => key === 'GetStateName'),
    ).toBeTruthy();

    expect(templateReferencesSlots[0].value).toBe(
      examplesPool.multipleReferences1.resolutions[0][0],
    );

    expect(templateReferencesSlots[3].value).toBe(
      examplesPool.multipleReferences2.resolutions[0][0],
    );
  });

  it('should build slots from given entities', () => {
    const activity = new ActivityBuilder().build();

    const slotsBuilder = new SlotsBuilder(
      activity,
      new Map().set('firstName', 'John').set('lastName', 'Doe'),
    );
    const [_, entitiesSlots] = slotsBuilder.build();

    expect(entitiesSlots.length).toBe(2);

    expect(entitiesSlots[0].key).toBe('firstName');
    expect(entitiesSlots[0].value).toBe('John');

    expect(entitiesSlots[1].key).toBe('lastName');
    expect(entitiesSlots[1].value).toBe('Doe');
  });

  it('should build slots from given activity and entities', () => {
    const activity = new ActivityBuilder()
      .setText(examplesPool.multipleReferences1.text)
      .setSpeak(examplesPool.multipleReferences2.text)
      .build();

    const slotsBuilder = new SlotsBuilder(
      activity,
      new Map().set('firstName', 'John').set('lastName', 'Doe'),
    );
    const [_, entitiesSlots] = slotsBuilder.build();

    expect(entitiesSlots.length).toBe(2);

    expect(entitiesSlots[0].key).toBe('firstName');
    expect(entitiesSlots[0].value).toBe('John');

    expect(entitiesSlots[1].key).toBe('lastName');
    expect(entitiesSlots[1].value).toBe('Doe');
  });
});

describe('LanguageGenerationResolver', () => {
  const findTemplateReferenceAPIRes = templateReference =>
    Object.keys(examplesPool)
      .map(key => examplesPool[key].apiResponses)
      .reduce((acc, APIResponses) => {
        return { ...acc, ...APIResponses };
      }, {})[templateReference] || { outputs: {} };

  beforeEach(() => {
    nock.cleanAll();

    nock('https://lg-cris-dev.westus2.cloudapp.azure.com/v1/lg')
      .persist()
      .post('')
      .reply((uri, requestBody, cb) => {
        const templateReference = Utilities.convertLGValueToString(
          requestBody.slots.GetStateName,
        );
        cb(null, [200, findTemplateReferenceAPIRes(templateReference)]);
      });
  });

  // /**
  //  * Cases:
  //  * 1) Invalid IDs and null or undefined inputs -> done
  //  * 2) Throwing/bubbling server errors
  //  * 3) Valid cases -> Done
  //  * 4) Invalid cases -> Partially Done
  //  * 6) With entities -> Done
  //  */

  it('should throw an error if an invalid key or application id are given', async () => {
    let err = null;
    try {
      const resolver = new LanguageGenerationResolver(
        { applicationId: '', endpointKey: '' },
        {},
      );

      const activity = new ActivityBuilder()
        .setText(examplesPool.multipleReferences1.text)
        .build();

      const entities = new Map();
      await resolver.resolve(activity, entities);
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });

  it('should throw an error if the activity or entities given are null', async () => {
    let err = null;
    try {
      const resolver = new LanguageGenerationResolver(
        { applicationId: '32432', endpointKey: '43234' },
        {},
      );

      await resolver.resolve(null, undefined);
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });

  it('should extract template references from all the possible fields', async () => {
    const resolver = new LanguageGenerationResolver(
      { applicationId: '32432', endpointKey: '43234' },
      {},
    );

    // All fields supplied

    const cardAction = new CardAction();

    cardAction.text = examplesPool.multipleReferences2.text;
    cardAction.displayText = examplesPool.singleReference2.text;

    const activity = new ActivityBuilder()
      .setText(examplesPool.multipleReferences1.text)
      .setSpeak(examplesPool.singleReference1.text)
      .addCardAction(cardAction)
      .build();

    await resolver.resolve(activity, new Map());

    expect(activity.text).toEqual(
      examplesPool.multipleReferences1.resolvedText,
    );
    expect(activity.speak).toEqual(examplesPool.singleReference1.resolvedText);
    expect(activity.suggestedActions.actions[0].text).toEqual(
      examplesPool.multipleReferences2.resolvedText,
    );
    expect(activity.suggestedActions.actions[0].displayText).toEqual(
      examplesPool.singleReference2.resolvedText,
    );

    // Some fields supplied

    const cardAction1 = new CardAction();

    cardAction1.displayText = examplesPool.multipleReferences2.text;

    const activity1 = new ActivityBuilder()
      .setSpeak(examplesPool.singleReference1.text)
      .addCardAction(cardAction1)
      .build();

    await resolver.resolve(activity1, new Map());

    expect(activity1.speak).toEqual(examplesPool.singleReference1.resolvedText);
    expect(activity1.suggestedActions.actions[0].displayText).toEqual(
      examplesPool.multipleReferences2.resolvedText,
    );
  });

  it(`should throw an error if there are missing resolutions from the api`, async () => {
    let err = null;
    try {
      const resolver = new LanguageGenerationResolver(
        { applicationId: '32432', endpointKey: '43234' },
        {},
      );

      // All fields supplied

      const activity = new ActivityBuilder()
        .setText('[missingTemplate]')
        .build();

      await resolver.resolve(activity, new Map());
    } catch (e) {
      err = e;
    }

    expect(err).toBeDefined();
  });

  it(`(e2e) should send entities to the api for proccesing`, async () => {
    const resolver = new LanguageGenerationResolver(
      { applicationId: '32432', endpointKey: '43234' },
      {},
    );

    const activity = new ActivityBuilder()
      .setSpeak(examplesPool.withEntities.text)
      .build();

    await resolver.resolve(activity, new Map([['user', 'John']]));

    expect(activity.speak).toEqual(examplesPool.withEntities.resolvedText);
  });

  // it('should throw an error if the API sends anything but 200 status code', async () => {
  //   nock.cleanAll();

  //   let err = null;
  //   const error401 = 'Cognitive Authentication Failed';
  //   try {
  //     nock('https://lg-cris-dev.westus2.cloudapp.azure.com/v1/lg')
  //       .post('')
  //       .reply((uri, requestBody, cb) => {
  //         cb(null, [401, error401]);
  //       });

  //     const resolver = new LanguageGenerationResolver({ applicationId: '32432', endpointKey: '43234' }, {});

  //     const activity = new ActivityBuilder().setSpeak(examplesPool.withEntities.text).build();

  //     // await resolver.resolve(activity, new Map());
  //   } catch (e) {
  //     err = e;
  //   } finally {
  //     expect(err.message).toEqual(error401);
  //   }
  // });
});
