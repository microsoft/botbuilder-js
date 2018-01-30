'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exportTypes(require('./generated/models'));
exportTypes(require('./customs/types'));

exports.ConnectorClient = require('./generated/connectorClient');
exports.MicrosoftAppCredentials = require('./customs/microsoftAppCredentials').MicrosoftAppCredentials;

function exportTypes(module) {
  Object.keys(module).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function get() {
        return module[key];
      }
    });
  })
}