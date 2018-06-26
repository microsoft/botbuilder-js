'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-botbuilder:app', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({botName: 'sample', description: 'sample', language: 'JavaScript'})
      .toPromise();
  });

  it('creates files', function () {
    assert.file([
      '.env',
      'app.js',
      'bot.js',
      'package.json',
      'README.md',
    ]);
  });
});
