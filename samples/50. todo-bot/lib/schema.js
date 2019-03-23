"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = {
    todoList: 'user.todos'
};
exports.conversation = {};
exports.dialog = {
    options: {},
    ids: {}
};
exports.variables = {
    print: {
        title: '{$title}'
    },
    title: '$title'
};
exports.intents = {
    AddToDo: '#AddToDo',
    DeleteToDo: '#DeleteToDo',
    ClearToDos: '#ClearToDos',
    ShowToDos: '#ShowToDos',
    Cancel: '#Cancel',
    Help: '#Help'
};
exports.entities = {
    title: '@title'
};
exports.events = {
    Error: 'error',
    CancelAdd: 'CancelAdd',
    CancelDelete: 'CancelDelete'
};
//# sourceMappingURL=schema.js.map