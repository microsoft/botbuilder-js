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
  LGAPI,
} = require('../');

const { isEmpty } = require('lodash');

const ENABLE_MOCKING = true;

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
    this.suggestedActions = {
      actions: [],
    };
  }
}

class SuggestedActions {}

class ActivityBuilder {
  constructor() {
    this.text = null;
    this.speak = null;
    this.locale = 'en-us';
    this.cardActions = [];
  }

  setText(text) {
    this.text = text;

    return this;
  }

  setLocale(locale) {
    this.locale = locale;

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
    activity.locale = this.locale;

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
    const templateReferences = PatternRecognizer.extractPatterns('[sayGoodMorning]');

    expect(templateReferences[0]).toEqual('sayGoodMorning');

    const templateReferences1 = PatternRecognizer.extractPatterns(
      '[sayHello], John! [welcomePhrase] to the {new} office.'
    );

    expect(templateReferences1[0]).toEqual('sayHello');
    expect(templateReferences1[1]).toEqual('welcomePhrase');
    expect(templateReferences1.length).toEqual(2);

    const templateReferences2 = PatternRecognizer.extractPatterns(
      '[sayGoodBye], John! [thankingPhrase] for your time, [scheduleMeeting].'
    );
    expect(templateReferences2[0]).toEqual('sayGoodBye');
    expect(templateReferences2[1]).toEqual('thankingPhrase');
    expect(templateReferences2[2]).toEqual('scheduleMeeting');
  });

  it('should return an empty array if no template references are found', () => {
    const templateReferences = PatternRecognizer.extractPatterns('Hello John, welcome to BF!');
    expect(templateReferences.length).toBe(0);
  });

  it('should handle tempelate references with entities included in the reference', () => {
    const templateReferences = PatternRecognizer.extractPatterns('[welcome:{user}]');

    expect(templateReferences[0]).toEqual('welcome:{user}');
  });

  it('should ignore invalid template references', () => {
    const templateReferences = PatternRecognizer.extractPatterns('[welcome\\]');
    expect(templateReferences[0]).toBeUndefined();
  });

  it('should replace all template references with their corresponding resolutions', () => {
    const templateReferences = new Map().set('sayGoodMorning', 'Hello');

    const newUtterance = PatternRecognizer.replacePatterns('[sayGoodMorning]', templateReferences);

    expect(newUtterance).toEqual('Hello');

    const templateReferences1 = new Map().set('sayHello', 'hello').set('welcomePhrase', 'welcome');

    const newUtterance1 = PatternRecognizer.replacePatterns(
      '[sayHello], John! [welcomePhrase] to the {new} office.',
      templateReferences1
    );

    expect(newUtterance1).toEqual('hello, John! welcome to the {new} office.');

    const templateReferences2 = new Map()
      .set('sayGoodBye', 'Bye')
      .set('thankingPhrase', 'thanks')
      .set('scheduleMeeting', `let's have a meeting`);

    const newUtterance2 = PatternRecognizer.replacePatterns(
      '[sayGoodBye], John! [thankingPhrase] for your time, [scheduleMeeting].',
      templateReferences2
    );

    expect(newUtterance2).toEqual(`Bye, John! thanks for your time, let's have a meeting.`);
  });

  it('should keep text as is if no template references are found', () => {
    const templateReferences = new Map().set('sayGoodMorning', 'Hello');

    const newUtterance = PatternRecognizer.replacePatterns(
      'Hello John, welcome to BF!',
      templateReferences
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
    const templateReferences = activityInspector.extractTemplateReferences();

    expect(templateReferences.length).toBe(7);
    expect(templateReferences.every(reference => !isEmpty(reference))).toBeTruthy();
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

    expect(activity.text).toEqual(examplesPool.multipleReferences1.resolvedText);
    expect(activity.speak).toEqual(examplesPool.multipleReferences2.resolvedText);
    expect(activity.suggestedActions.actions[0].text).toEqual(
      examplesPool.singleReference1.resolvedText
    );
    expect(activity.suggestedActions.actions[0].displayText).toEqual(
      examplesPool.singleReference2.resolvedText
    );
  });
});

describe('Utilities.convertLGValueToString', () => {
  it('should unwrap string LGValue into string', () => {
    const strLGVal = 'LanguageGeneration';
    const strVal = Utilities.convertLGValueToString({
      StringValues: [strLGVal],
      ValueType: 0,
    });
    expect(strVal).toEqual(strLGVal + '');
  });

  it('should convert int LGValue to string', () => {
    const integerVal = 10;
    const strVal = Utilities.convertLGValueToString({
      IntValues: [integerVal],
      ValueType: 1,
    });
    expect(strVal).toEqual(integerVal + '');
  });

  it('should convert float LGValue to string', () => {
    const floatVal = 10.0;
    const strVal = Utilities.convertLGValueToString({
      FloatValues: [floatVal],
      ValueType: 2,
    });
    expect(strVal).toEqual(floatVal + '');
  });

  it('should convert boolean LGValue to string', () => {
    const booleanVal = false;
    const strVal = Utilities.convertLGValueToString({
      BooleanValues: [booleanVal],
      ValueType: 3,
    });
    expect(strVal).toEqual(booleanVal + '');
  });

  it('should convert Date LGValue to string', () => {
    const dateVal = new Date().toUTCString();
    const strVal = Utilities.convertLGValueToString({
      DateTimeValues: [dateVal],
      ValueType: 4,
    });
    expect(strVal).toEqual(dateVal + '');
  });
});

describe('Utilities.convertSlotToLGValue', () => {
  it('should convert from string to lgVal', () => {
    const val = 'val';
    const lgVal = Utilities.convertSlotToLGValue({ key: 'key', value: val });
    expect(lgVal.ValueType).toEqual(0);
    expect(lgVal.StringValues[0]).toEqual(val);
    expect(lgVal.IntValues).toBeUndefined();
    expect(lgVal.FloatValues).toBeUndefined();
    expect(lgVal.BooleanValues).toBeUndefined();
    expect(lgVal.DateTimeValues).toBeUndefined();
  });

  it('should convert from integer to lgVal', () => {
    const val = 10;
    const lgVal = Utilities.convertSlotToLGValue({ key: 'key', value: val });
    expect(lgVal.ValueType).toEqual(1);
    expect(lgVal.IntValues[0]).toEqual(val);
    expect(lgVal.StringValues).toBeUndefined();
    expect(lgVal.FloatValues).toBeUndefined();
    expect(lgVal.BooleanValues).toBeUndefined();
    expect(lgVal.DateTimeValues).toBeUndefined();
  });

  it('should convert from float to lgVal', () => {
    const val = 10.2;
    const lgVal = Utilities.convertSlotToLGValue({ key: 'key', value: val });
    expect(lgVal.ValueType).toEqual(2);
    expect(lgVal.FloatValues[0]).toEqual(val);
    expect(lgVal.StringValues).toBeUndefined();
    expect(lgVal.IntValues).toBeUndefined();
    expect(lgVal.BooleanValues).toBeUndefined();
    expect(lgVal.DateTimeValues).toBeUndefined();
  });

  it('should convert from boolean to lgVal', () => {
    const val = false;
    const lgVal = Utilities.convertSlotToLGValue({ key: 'key', value: val });
    expect(lgVal.ValueType).toEqual(3);
    expect(lgVal.BooleanValues[0]).toEqual(val);
    expect(lgVal.StringValues).toBeUndefined();
    expect(lgVal.IntValues).toBeUndefined();
    expect(lgVal.FloatValues).toBeUndefined();
    expect(lgVal.DateTimeValues).toBeUndefined();
  });

  it('should convert from Date to lgVal', () => {
    const val = new Date();
    const lgVal = Utilities.convertSlotToLGValue({ key: 'key', value: val });
    expect(lgVal.ValueType).toEqual(4);
    expect(lgVal.DateTimeValues[0]).toEqual(val.toISOString());
    expect(lgVal.StringValues).toBeUndefined();
    expect(lgVal.IntValues).toBeUndefined();
    expect(lgVal.FloatValues).toBeUndefined();
    expect(lgVal.BooleanValues).toBeUndefined();
  });
});

describe('Utilities.extractTemplateReferenceAndResolution', () => {
  it('should extract template reference and resolution from the given LGResonse', () => {
    const lgVal = {
      StringValues: ['hello'],
      ValueType: 0,
    };

    const [reference, resolution] = Utilities.extractTemplateReferenceAndResolution({
      Outputs: {
        DisplayText: lgVal,
      },
      templateId: 'sayHello',
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
    const [templateReferences] = slotsBuilder.build();

    expect(templateReferences.length).toBe(
      examplesPool.multipleReferences1.resolutions.length +
        examplesPool.multipleReferences2.resolutions.length
    );

    expect(templateReferences[0]).toBe(examplesPool.multipleReferences1.resolutions[0][0]);

    expect(templateReferences[3]).toBe(examplesPool.multipleReferences2.resolutions[0][0]);
  });

  it('should build slots from given entities', () => {
    const activity = new ActivityBuilder().build();

    const slotsBuilder = new SlotsBuilder(
      activity,
      new Map().set('firstName', 'John').set('lastName', 'Doe')
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
      new Map().set('firstName', 'John').set('lastName', 'Doe')
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
  const application = {
    applicationId: 'lgmodelfortesting',
    endpointKey: '4262b7b8accc4fceaa6da4174f9c2a67',
  };

  const findTemplateReferenceAPIRes = templateReference =>
    Object.keys(examplesPool)
      .map(key => examplesPool[key].apiResponses)
      .reduce((acc, APIResponses) => {
        return { ...acc, ...APIResponses };
      }, {})[templateReference] || { Outputs: {} };

  const mockAuthentication = () =>
    nock(LGAPI.ISSUE_TOKEN_URL)
      .persist()
      .post('')
      .reply(200, 'token');

  beforeEach(() => {
    nock.cleanAll();

    if (ENABLE_MOCKING) {
      mockAuthentication();

      nock(LGAPI.BASE_URL + LGAPI.RESOURCE_URL)
        .persist()
        .post('')
        .reply((uri, requestBody, cb) => {
          const templateReference = requestBody.templateId;

          cb(null, [200, JSON.stringify(findTemplateReferenceAPIRes(templateReference))]);
        });
    }
  });

  it('should throw an error if an invalid key or application id are given', async () => {
    let err = null;
    try {
      const resolver = new LanguageGenerationResolver(
        {
          applicationId: '',
          endpointKey: '',
        },
        {}
      );

      const activity = new ActivityBuilder().setText(examplesPool.multipleReferences1.text).build();

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
      const resolver = new LanguageGenerationResolver(application, {});

      await resolver.resolve(null, undefined);
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });

  it('should extract template references from all the possible fields', () => {
    const resolver = new LanguageGenerationResolver(application, {});

    // All fields supplied

    const cardAction = new CardAction();

    cardAction.text = examplesPool.multipleReferences2.text;
    cardAction.displayText = examplesPool.singleReference2.text;

    const activity = new ActivityBuilder()
      .setText(examplesPool.multipleReferences1.text)
      .setSpeak(examplesPool.singleReference1.text)
      .addCardAction(cardAction)
      .build();

    return resolver.resolve(activity, new Map()).then(() => {
      expect(activity.text).toEqual(examplesPool.multipleReferences1.resolvedText);
      expect(activity.speak).toEqual(examplesPool.singleReference1.resolvedText);
      expect(activity.suggestedActions.actions[0].text).toEqual(
        examplesPool.multipleReferences2.resolvedText
      );
      expect(activity.suggestedActions.actions[0].displayText).toEqual(
        examplesPool.singleReference2.resolvedText
      );

      // Some fields supplied

      const cardAction1 = new CardAction();

      cardAction1.displayText = examplesPool.multipleReferences2.text;

      const activity1 = new ActivityBuilder()
        .setSpeak(examplesPool.singleReference1.text)
        .addCardAction(cardAction1)
        .build();

      return resolver.resolve(activity1, new Map()).then(() => {
        expect(activity1.speak).toEqual(examplesPool.singleReference1.resolvedText);
        expect(activity1.suggestedActions.actions[0].displayText).toEqual(
          examplesPool.multipleReferences2.resolvedText
        );
      });
    });
  }).timeout(600000);

  it(`should throw an error if there are missing resolutions from the api`, async () => {
    let err = null;
    try {
      const resolver = new LanguageGenerationResolver(application, {});

      // All fields supplied

      const activity = new ActivityBuilder().setText('[missingTemplate]').build();

      await resolver.resolve(activity, new Map());
    } catch (e) {
      err = e;
    }

    expect(err).toBeDefined();
  }).timeout(600000);

  it(`should send entities to the api for proccesing`, async () => {
    const resolver = new LanguageGenerationResolver(application, {});

    const activity = new ActivityBuilder().setSpeak(examplesPool.withEntities.text).build();

    await resolver.resolve(activity, new Map([['user', 'John']]));

    expect(activity.speak).toEqual(examplesPool.withEntities.resolvedText);
  }).timeout(600000);

  it('should throw a custom error coming from the backend if the API sends 401', async () => {
    let err = null;

    nock.cleanAll();
    mockAuthentication();

    if (ENABLE_MOCKING) {
      nock(LGAPI.BASE_URL + LGAPI.RESOURCE_URL)
        .post('')
        .reply((uri, requestBody, cb) => {
          cb(null, [401, '']);
        });
    }

    try {
      const resolver = new LanguageGenerationResolver(application, {});

      const activity = new ActivityBuilder().setSpeak(examplesPool.withEntities.text).build();

      await resolver.resolve(activity, new Map());
    } catch (e) {
      err = e;
    } finally {
      expect(err.message).toEqual('Cognitive Authentication Failed');
    }
  });

  it('should throw a internal error if the response status code is anything but 200, 401', async () => {
    if (ENABLE_MOCKING) {
      let err = null;

      nock.cleanAll();
      mockAuthentication();

      nock(LGAPI.BASE_URL + LGAPI.RESOURCE_URL)
        .post('')
        .reply((uri, requestBody, cb) => {
          cb(null, [500, null]);
        });

      try {
        const resolver = new LanguageGenerationResolver(application, {});

        const activity = new ActivityBuilder().setSpeak(examplesPool.withEntities.text).build();

        await resolver.resolve(activity, new Map());
      } catch (e) {
        err = e;
      } finally {
        expect(err.message).toEqual('Internal Error');
      }

      let err1 = null;

      nock.cleanAll();
      mockAuthentication();

      nock(LGAPI.BASE_URL + LGAPI.RESOURCE_URL)
        .post('')
        .reply((uri, requestBody, cb) => {
          cb(null, [400, null]);
        });

      try {
        const resolver = new LanguageGenerationResolver(application, {});

        const activity = new ActivityBuilder().setSpeak(examplesPool.withEntities.text).build();

        await resolver.resolve(activity, new Map());
      } catch (e) {
        err1 = e;
      } finally {
        expect(err1.message).toEqual('Internal Error');
      }
    }
  });
});
