"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_rules_1 = require("botbuilder-rules");
const schema_1 = require("../../schema");
const recognizer_1 = require("../recognizer");
class ShowToDos extends botbuilder_rules_1.AdaptiveDialog {
    constructor() {
        super('ShowToDos');
        // Use parents recognizer
        this.recognizer = recognizer_1.getRecognizer();
        // Define main conversation flow
        this.addRule(new botbuilder_rules_1.BeginDialogRule([
            new botbuilder_rules_1.IfProperty(schema_1.user.todoList, [
                new botbuilder_rules_1.SendList(schema_1.user.todoList, `Here are your todos:`)
            ]).else([
                new botbuilder_rules_1.SendActivity(`You have no todos.`)
            ]),
            new botbuilder_rules_1.EndDialog()
        ]));
    }
}
exports.ShowToDos = ShowToDos;
//# sourceMappingURL=index.js.map