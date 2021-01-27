/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { MemoryScope } from './memoryScope';
import { ScopePath } from '../scopePath';
import { DialogContext } from '../../dialogContext';
import { DialogTurnStateConstants } from '../../dialogTurnStateConstants';
import { merge } from 'lodash';

/**
 * The setting node.
 */
class Node {
    public constructor(public value?: string) {}
    public children: Node[] = [];
}

/**
 * SettingsMemoryScope maps "settings" -> dc.context.turnState['settings']
 */
export class SettingsMemoryScope extends MemoryScope {
    /**
     * Initializes a new instance of the [SettingsMemoryScope](xref:botbuilder-dialogs.SettingsMemoryScope) class.
     */
    public constructor() {
        super(ScopePath.settings, false);
    }

    /**
     * Gets the backing memory for this scope.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) object for this turn.
     * @returns The memory for the scope.
     */
    public getMemory(dc: DialogContext): Record<string, unknown> {
        let settings: Record<string, unknown> = {};
        if (dc.context.turnState.has(ScopePath.settings)) {
            settings = dc.context.turnState.get(ScopePath.settings);
        } else {
            const configuration = dc.context.turnState.get(DialogTurnStateConstants.configuration);
            if (configuration) {
                settings = SettingsMemoryScope.loadSettings(configuration);
                dc.context.turnState.set(ScopePath.settings, settings);
            }
        }
        const envSettings = SettingsMemoryScope.loadSettings(process.env);
        merge(settings, envSettings);
        return settings;
    }

    /**
     * Build a dictionary view of configuration providers.
     *
     * @param configuration The configuration that we are running with.
     * @returns Projected dictionary for settings.
     */
    protected static loadSettings(configuration: Record<string, string>): Record<string, unknown> {
        const settings = {};
        if (configuration) {
            // load configuration into settings
            const root = this.convertFlattenSettingToNode(Object.entries(configuration));
            root.children.forEach((u) => {
                settings[u.value] = this.convertNodeToObject(u);
            });
        }
        return settings;
    }

    /**
     * Generate a node tree with the flatten settings.
     * For example:
     * {
     *   "array":["item1", "item2"],
     *   "object":{"array":["item1"], "2":"numberkey"}
     * }
     *
     * Would generate a flatten settings like:
     * array:0 item1
     * array:1 item2
     * object:array:0 item1
     * object:2 numberkey
     *
     * After Converting it from flatten settings into node tree, would get:
     *
     *                         null
     *                |                     |
     *              array                object
     *            |        |            |        |
     *           0          1        array        2
     *           |          |         |           |
     *         item1       item2      0        numberkey
     *                                |
     *                              item1
     * The result is a Tree.
     *
     * @param kvs Configurations with key value pairs.
     * @returns The root node of the tree.
     */
    private static convertFlattenSettingToNode(kvs: Array<[key: string, value: string]>): Node {
        const root = new Node();

        kvs.forEach(([key, value]) => {
            const keyChain = key.split(':');
            let currentNode = root;
            keyChain.forEach((item) => {
                const matchItem = currentNode.children.find((u) => u?.value === item);
                if (!matchItem) {
                    // Remove all the leaf children
                    currentNode.children = currentNode.children.filter((u) => u.children.length !== 0);

                    // Append new child into current node
                    const node = new Node(item);
                    currentNode.children.push(node);
                    currentNode = node;
                } else {
                    currentNode = matchItem;
                }
            });

            currentNode.children.push(new Node(value));
        });

        return root;
    }

    private static convertNodeToObject(node: Node): unknown {
        if (!node.children.length) {
            return {};
        }

        // If the child is leaf node, return its value directly.
        if (node.children.length === 1 && node.children[0].children.length === 0) {
            return node.children[0].value;
        }

        // check if all the children are number format.
        let pureNumberIndex = true;
        let indexArray: number[] = [];
        let indexMax = -1;
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (/^-?\d+$/.test(child.value)) {
                const num = parseInt(child.value);
                if (!isNaN(num) && num >= 0) {
                    indexArray.push(num);
                    if (num > indexMax) {
                        indexMax = num;
                    }
                    continue;
                }
            }
            pureNumberIndex = false;
            break;
        }

        if (pureNumberIndex) {
            // all children are int numbers, treat it as array.
            const listResult = new Array(indexMax + 1);
            for (let i = 0; i < node.children.length; i++) {
                listResult[indexArray[i]] = this.convertNodeToObject(node.children[i]);
            }

            return listResult;
        }

        // Convert all child into dictionary
        const result = {};
        node.children.forEach((u) => (result[u.value] = this.convertNodeToObject(u)));
        return result;
    }
}
