"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/* eslint-disable @typescript-eslint/explicit-function-return-type */
require("mocha");
var adaptive_expressions_1 = require("adaptive-expressions");
var assert = require("assert");
var __1 = require("../");
describe('ChoiceSetTests', function () {
    var _this = this;
    this.timeout(10000);
    it('TestExpression', function () { return __awaiter(_this, void 0, void 0, function () {
        var state, ep, _a, value, error;
        return __generator(this, function (_b) {
            state = {
                choices: [
                    { value: "test1" },
                    { value: "test2" },
                    { value: "test3" },
                ]
            };
            ep = new adaptive_expressions_1.ObjectExpression("choices");
            _a = ep.tryGetValue(state), value = _a.value, error = _a.error;
            assert.equal('test1', value[0].value);
            assert.equal('test2', value[1].value);
            assert.equal('test3', value[2].value);
            return [2 /*return*/];
        });
    }); });
    it('TestValue', function () { return __awaiter(_this, void 0, void 0, function () {
        var state, ep, _a, value, error;
        return __generator(this, function (_b) {
            state = {};
            ep = new adaptive_expressions_1.ObjectExpression(new __1.ChoiceSet([{ value: 'test1' }, { value: 'test2' }, { value: 'test3' }]));
            _a = ep.tryGetValue(state), value = _a.value, error = _a.error;
            assert.equal('test1', value[0].value);
            assert.equal('test2', value[1].value);
            assert.equal('test3', value[2].value);
            return [2 /*return*/];
        });
    }); });
    it('TestStringArrayAccess', function () { return __awaiter(_this, void 0, void 0, function () {
        var state, stringArr, ep, _a, value, error;
        return __generator(this, function (_b) {
            state = {};
            stringArr = ['test1', 'test2', 'test3'];
            ep = new adaptive_expressions_1.ObjectExpression(new __1.ChoiceSet(stringArr));
            _a = ep.tryGetValue(state), value = _a.value, error = _a.error;
            assert.equal('test1', value[0].value);
            assert.equal('test2', value[1].value);
            assert.equal('test3', value[2].value);
            return [2 /*return*/];
        });
    }); });
    it('TestConverterExpressionAccess', function () { return __awaiter(_this, void 0, void 0, function () {
        var state, sample, ep, _a, value, error;
        return __generator(this, function (_b) {
            state = {
                test: [
                    { value: "test1" },
                    { value: "test2" },
                    { value: "test3" },
                ]
            };
            sample = {
                choices: 'test'
            };
            ep = new adaptive_expressions_1.ObjectExpression(sample.choices);
            _a = ep.tryGetValue(state), value = _a.value, error = _a.error;
            assert.equal('test1', value[0].value);
            assert.equal('test2', value[1].value);
            assert.equal('test3', value[2].value);
            return [2 /*return*/];
        });
    }); });
    it('TestConvertObjectAccess', function () { return __awaiter(_this, void 0, void 0, function () {
        var state, sample, json, bar, choicesBar, _a, value, error;
        return __generator(this, function (_b) {
            state = {};
            sample = {
                choices: [
                    { value: 'test1' },
                    { value: 'test2' },
                    { value: 'test3' }
                ]
            };
            json = JSON.stringify(sample);
            bar = JSON.parse(json);
            choicesBar = new adaptive_expressions_1.ObjectExpression(bar.choices);
            _a = choicesBar.tryGetValue(state), value = _a.value, error = _a.error;
            assert.equal('test1', value[0].value);
            assert.equal('test2', value[1].value);
            assert.equal('test3', value[2].value);
            return [2 /*return*/];
        });
    }); });
    it('TestConvertStringAccess', function () { return __awaiter(_this, void 0, void 0, function () {
        var state, sample, json, bar, choicesBar, _a, value, error;
        return __generator(this, function (_b) {
            state = {};
            sample = {
                choices: [
                    'test1',
                    'test2',
                    'test3',
                ]
            };
            json = JSON.stringify(sample);
            bar = JSON.parse(json);
            bar.choices = new __1.ChoiceSet(bar.choices);
            choicesBar = new adaptive_expressions_1.ObjectExpression(bar.choices);
            _a = choicesBar.tryGetValue(state), value = _a.value, error = _a.error;
            assert.equal('test1', value[0].value);
            assert.equal('test2', value[1].value);
            assert.equal('test3', value[2].value);
            return [2 /*return*/];
        });
    }); });
    it('TestConvertStringArray', function () { return __awaiter(_this, void 0, void 0, function () {
        var state, sample, json, value;
        return __generator(this, function (_a) {
            state = {};
            sample = [];
            sample.push('test1');
            sample.push('test2');
            sample.push('test3');
            json = JSON.stringify(sample);
            value = new __1.ChoiceSet(JSON.parse(json));
            assert.equal('test1', value[0].value);
            assert.equal('test2', value[1].value);
            assert.equal('test3', value[2].value);
            return [2 /*return*/];
        });
    }); });
});
