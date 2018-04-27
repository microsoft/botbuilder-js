'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('generator-botbuilder-js:app', () => {
  beforeAll(() => {
    return helpers
      .run(path.join(__dirname, '../generators/app'))
      .withPrompts({ someAnswer: true });
  });

  it('creates files', () => {
    assert.file(['app.*']);
    assert.file(['package.json']);
    assert.file(['.gitignore']);
    assert.file(['.env']);
    assert.file(['README.md']);
  });
});
