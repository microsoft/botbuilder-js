const { Constant, Expression, ExpressionType, Quantifier, QuantifierType, RelationshipType, TriggerTree } = require('../lib');
const assert = require('assert');

const doubleEpsilon = 0.000001;

const comparisons = [
    ExpressionType.LessThan,
    ExpressionType.LessThanOrEqual,
    ExpressionType.Equal,
    ExpressionType.GreaterThanOrEqual,
    ExpressionType.GreaterThan
];

class Generator {

    generatePredicates(n, nameBase) {
        const expressions = [];
        for (let i = 0; i < n; ++i) {
            const name = `${ nameBase }${ i }`;
            expressions.push(
                this.randomWeighted([1.0, 1.0]) ? this.generateSimpleComparison(name) : this.generateHasValueComparison(name)
            );
        }
        return expressions;
    }

    generateConjunctions(predicates, numConjunctions, minClause, maxClause) {
        const conjunctions = [];
        for (let i = 0; i < numConjunctions; ++i) {
            const clauses = minClause + Math.floor(Math.random() * (maxClause - minClause));
            const expressions = [];
            const used = [];
            for (let j = 0; j < clauses; ++j) {
                let choice;
                do {
                    choice = Math.floor(Math.random() * predicates.length);
                } while (used.findIndex(item => item === choice) >= 0);

                expressions.push(predicates[choice]);
                used.push(choice);
            }

            const { expression: conjunction, bindings } = this.binary(ExpressionType.And, expressions);
            const expressionInfo = {
                expression: conjunction,
                bindings,
                quantifiers: []
            };
            conjunctions.push(expressionInfo);
        }
        return conjunctions;
    }

    generateDisjunctions(predicates, numDisjunctions, minClause, maxClause) {
        const disjunctions = [];
        for (let i = 0; i < numDisjunctions; ++i) {
            const clauses = minClause + Math.floor(Math.random() * (maxClause - minClause));
            const expressions = [];
            const used = [];
            for (let j = 0; j < clauses; ++j) {
                let choice;
                do {
                    choice = Math.floor(Math.random() * predicates.length);
                } while (used.findIndex(item => item === choice) >= 0);
                expressions.push(predicates[choice]);
                used.push(choice);
            }

            const { expression: disjunction, bindings } = this.binary(ExpressionType.Or, expressions);
            const expressionInfo = {
                expression: disjunction,
                bindings,
                quantifiers: []
            };
            disjunctions.push(expressionInfo);
        }

        return disjunctions;
    }

    generateOptionals(predicates, numOptionals, minClause, maxClause) {
        const optionals = [];
        for (let i = 0; i < numOptionals; ++i) {
            const clauses = minClause + Math.floor(Math.random() * (maxClause - minClause));
            const expressions = [];
            const used = [];
            for (let j = 0; j < clauses; ++j) {
                let choice;
                do {
                    choice = Math.floor(Math.random() * predicates.length);
                } while (used.findIndex(item => item === choice) >= 0);

                const predicate = predicates[choice];
                if (j === 0) {
                    let optional = Expression.makeExpression(undefined, Expression.lookup(ExpressionType.Optional), predicate.expression);
                    if (Math.random() < 0.25) {
                        optional = Expression.notExpression(optional);
                    }

                    const expressionInfo = {
                        expression: optional,
                        bindings: predicate.bindings,
                        quantifiers: []
                    };
                    expressions.push(expressionInfo);
                } else {
                    expressions.push(predicate);
                }

                used.push(choice);
            }

            const { expression: optional, bindings } = this.binary(ExpressionType.Or, expressions);
            const expressionInfo = {
                expression: optional,
                bindings,
                quantifiers: []
            };
            optionals.push(expressionInfo);
        }

        return optionals;
    }

    generateQuantifiers(predicates, numExpressions, maxVariable, maxExpansion, maxQuantifiers) {
        const result = [];
        const allBindings = this.mergeBindings(predicates);
        const allTypes = this.variablesByType(allBindings);
        for (let exp = 0; exp < numExpressions; ++exp) {
            const expression = this.randomChoice(predicates);
            const info = {
                expression: expression.expression,
                bindings: new Map(),
                quantifiers: []
            };
            const numQuants = 1 + Math.floor(Math.random() * (maxQuantifiers - 1));
            const chosen = new Set();
            const bindingKeys = expression.bindings.keys();
            const maxBase = Math.min(bindingKeys.length, numQuants);
            for (let quant = 0; quant < maxBase; ++quant) {
                let baseBinding;
                // Can only map each expression variable once in a quantifier
                do {
                    const randomIndex = Math.floor(Math.random() * bindingKeys.length);
                    const bindingKey = bindingKeys[randomIndex];
                    const bindingValue = expression.bindings.get(bindingKey);
                    baseBinding = {
                        key: bindingKey,
                        value: bindingValue
                    };
                } while (chosen.has(baseBinding.key));
                chosen.add(baseBinding.key);
                const mappings = [];
                const expansion = 1 + Math.floor(Math.random() * (maxExpansion - 1));
                for (let i = 0; i < expansion; ++i) {
                    if (i === 0) {
                        mappings.push(`${ baseBinding.key }`);
                    } else {
                        const { value } = baseBinding.value;
                        const mapping = this.randomChoice(allTypes.get(typeof value));
                        if (mappings.findIndex(item => item === mapping) === -1) {
                            mappings.push(mapping);
                        }
                    }
                }

                const any = Math.random() < 0.5;
                if (any) {
                    const mem = this.randomChoice(mappings);
                    if (!info.bindings.has(mem)) {
                        info.bindings.set(mem, baseBinding.value);
                    }

                    info.quantifiers.push(new Quantifier(baseBinding.key, QuantifierType.any, mappings));
                } else {
                    for (const mapping of mappings) {
                        if (!info.bindings.has(mapping)) {
                            info.bindings.set(mapping, baseBinding.value);
                        }
                    }

                    info.quantifiers.push(new Quantifier(baseBinding.key, QuantifierType.all, mappings));
                }
            }

            result.push(info);
        }

        return result;
    }

    generateNots(predicates, numNots) {
        const result = [];
        for (let i = 0; i < numNots; ++i) {
            const expr = this.randomChoice(predicates);
            const bindings = new Map();
            expr.bindings.forEach((value, key) => {
                const comparison = this.notValue(value);
                if (comparison) {
                    bindings.set(key, comparison);
                }
            });

            const expressionInfo = {
                expression: Expression.notExpression(expr.expression),
                bindings,
                quantifiers: expr.quantifiers
            };
            result.push(expressionInfo);
        }
        return result;
    }

    generateSimpleComparison(name) {
        let expression;
        let value;
        const type = this.randomChoice(comparisons);
        const selection = Math.floor(Math.random() * 2);
        switch (selection) {
            case 0:
                value = Math.floor(Math.random() * 2147483647);
                expression = Expression.makeExpression(
                    type,
                    undefined,
                    Expression.makeExpression(ExpressionType.Accessor, undefined, new Constant(name)),
                    new Constant(this.adjustIntValue(value, type))
                );
                break;
            case 1:
                value = Math.random();
                expression = Expression.makeExpression(
                    type,
                    undefined,
                    Expression.makeExpression(ExpressionType.Accessor, undefined, new Constant(name)),
                    new Constant(this.adjustDoubleValue(value, type))
                );
                break;
        }
        return {
            expression,
            bindings: new Map().set(name, { type, value }),
            quantifiers: []
        };
    }

    generateHasValueComparison(name) {
        let expression;
        let value;
        const selection = Math.floor(Math.random() * 3);
        switch (selection) {
            case 0:
                expression = Expression.makeExpression(
                    ExpressionType.Exists,
                    undefined,
                    Expression.makeExpression(ExpressionType.Accessor, undefined, new Constant(name))
                );
                value = Math.floor(Math.random() * 2147483647);
                break;
            case 1:
                expression = Expression.makeExpression(
                    ExpressionType.Exists,
                    undefined,
                    Expression.makeExpression(ExpressionType.Accessor, undefined, new Constant(name))
                );
                value = Math.random();
                break;
            case 2:
                expression = Expression.makeExpression(
                    ExpressionType.NotEqual,
                    undefined,
                    Expression.makeExpression(ExpressionType.Accessor, undefined, new Constant(name)),
                    new Constant(null)
                );
                value = this.randomString(5);
                break;
        }

        return {
            expression,
            bindings: new Map().set(name, {
                value,
                type: ExpressionType.Not
            }),
            quantifiers: []
        };
    }

    mergeBindings(expressions) {
        const bindings = new Map();
        expressions.forEach(info => {
            info.bindings.forEach((value, key) => {
                bindings.set(key, value);
            });
        });
        return bindings;
    }

    randomString(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            const index = Math.floor(Math.random() * 26);
            result += chars[index];
        }
        return result;
    }

    randomChoice(choices) {
        const selection = Math.floor(Math.random() * choices.length);
        return choices[selection];
    }

    randomWeighted(weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

        const selection = Math.random() * totalWeight;
        let soFar = 0;
        let result = 0;
        for (let i = 0; i < weights.length; ++i) {
            if (soFar <= selection) {
                soFar += weights[i];
                result = i;
            } else {
                break;
            }
        }

        return result;
    }

    adjustIntValue(value, type) {
        let result = value;
        const epsilon = 1;
        switch (type) {
            case ExpressionType.LessThan:
            case ExpressionType.NotEqual:
                result += epsilon;
                break;
            case ExpressionType.GreaterThan:
                result -= epsilon;
                break;
        }
        return result;
    }

    adjustDoubleValue(value, type) {
        let result = value;
        switch (type) {
            case ExpressionType.LessThan:
            case ExpressionType.NotEqual:
                result += doubleEpsilon;
                break;
            case ExpressionType.GreaterThan:
                result -= doubleEpsilon;
                break;
        }
        return result;
    }

    binary(type, expressions) {
        const bindings = this.mergeBindings(expressions);
        let binaryExpression;
        for (const info of expressions) {
            if (!binaryExpression) {
                binaryExpression = info.expression;
            } else {
                binaryExpression = Expression.makeExpression(
                    type,
                    undefined,
                    binaryExpression,
                    info.expression
                );
            }
        }
        return {
            expression: binaryExpression,
            bindings
        };
    }

    notValue(comparison) {
        let { value } = comparison;
        const type = typeof value;
        let isNot = false;

        switch (comparison.type) {
            case ExpressionType.LessThanOrEqual:
            case ExpressionType.LessThan:
                if (type === 'number') {
                    if (Number.isInteger(value)) {
                        value += 1;
                    } else {
                        value += doubleEpsilon;
                    }
                }
                break;
            case ExpressionType.Equal:
                if (type === 'number') {
                    if (Number.isInteger(value)) {
                        value -= 1;
                    } else {
                        value -= doubleEpsilon;
                    }
                }
                break;
            case ExpressionType.NotEqual:
                if (type === 'number') {
                    if (Number.isInteger(value)) {
                        value -= 1;
                    } else {
                        value -= doubleEpsilon;
                    }
                }
                break;
            case ExpressionType.GreaterThanOrEqual:
            case ExpressionType.GreaterThan:
                if (type === 'number') {
                    if (Number.isInteger(value)) {
                        value -= 1;
                    } else {
                        value -= doubleEpsilon;
                    }
                }
                break;
            case ExpressionType.Not:
                isNot = true;
                break;
        }

        return isNot ? undefined : { type: comparison.type, value };
    }

    variablesByType(bindings) {
        const result = new Map();
        bindings.forEach((value, key) => {
            const type = typeof value;
            if (!result.has(type)) {
                result.set(type, []);
            }
            result.get(type).push(key);
        });

        return result;
    }
}

const verifyTree = (tree) => {
    const badNode = tree.verifyTree();
    assert.strictEqual(badNode, undefined);
};

describe('TriggerTree', () => {
    const generator = new Generator();

    it('Test Root', () => {
        const tree = new TriggerTree();
        tree.addTrigger('true', 'root');
        const matches = tree.matches({});
        assert.strictEqual(matches.length, 1);
        assert.strictEqual(matches[0].action, 'root');
    });

    it('Test Ignore', () => {
        const tree = new TriggerTree();
        tree.addTrigger('ignore(!exists(foo)) && exists(blah)', 1);
        tree.addTrigger('exists(blah) && ignore(!exists(foo2)) && woof == 3', 2);
        tree.addTrigger('exists(blah) && woof == 3', 3);
        tree.addTrigger('exists(blah) && woof == 3 && ignore(!exists(foo2))', 2);
        const frame = { 'blah': 1, 'woof': 3 };
        const matches = tree.matches(frame);
        assert.strictEqual(matches.length, 2);
        assert.strictEqual(matches[0].action, 2);
        assert.strictEqual(matches[1].action, 3);
    });

    it('Test Or', () => {
        const tree = new TriggerTree();
        tree.addTrigger('exists(woof) || exists(blah)', 1);
        tree.addTrigger('exists(blah)', 2);
        tree.addTrigger('exists(blah) && exists(foo)', 3);
        const frame = { 'blah': 1, 'woof': 3 };
        const matches = tree.matches(frame);
        assert.strictEqual(matches.length, 2);
        assert.strictEqual(matches[0].action, 1);
        assert.strictEqual(matches[1].action, 2);
    });

    it('Test TrueFalse', () => {
        const tree = new TriggerTree();
        tree.addTrigger('exists(blah) && true', 1);
        tree.addTrigger('exists(blah) && false', 2);
        tree.addTrigger('exists(blah)', 3);
        tree.addTrigger('true', 4);
        tree.addTrigger('false', 5);
        const memory = {};
        let matches = tree.matches(memory);
        assert.strictEqual(matches.length, 1);
        assert.strictEqual(matches[0].action, 4);

        memory['blah'] = 1;
        matches = tree.matches(memory);
        assert.strictEqual(matches.length, 2);
        assert.strictEqual(matches[0].action, 1);
        assert.strictEqual(matches[1].action, 3);
    });

    it('Test Tree', () => {
        const numPredicates = 50;
        const numSingletons = 25;
        const numConjunctions = 50;
        const numDisjunctions = 50;
        const numOptionals = 50;
        const numQuantifiers = 50;
        const numNots = 50;

        const minClause = 2;
        const maxClause = 4;
        const maxExpansion = 3;
        const maxQuantifiers = 3;
        const singletons = generator.generatePredicates(numPredicates, 'mem');
        const tree = new TriggerTree();
        const predicates = [...singletons];
        const triggers = [];

        // Add singletons
        for (const predicate of singletons.slice(0, numSingletons)) {
            triggers.push(tree.addTrigger(predicate.expression, predicate.bindings));
        }
        assert.strictEqual(tree.totalTriggers, numSingletons);

        // Add conjunctions and test matches
        const conjunctions = generator.generateConjunctions(predicates, numConjunctions, minClause, maxClause);
        for (const conjunction of conjunctions) {
            const memory = {};
            conjunction.bindings.forEach((binding, key) => {
                const { value } = binding;
                memory[key] = value;
            });

            const trigger = tree.addTrigger(conjunction.expression, conjunction.bindings);
            const matches = tree.matches(memory);
            triggers.push(trigger);
            assert(matches.length >= 1);
            const first = matches[0].clauses[0];
            for (const match of matches) {
                assert.strictEqual(first.relationship(match.clauses[0], tree.comparers), RelationshipType.equal);
            }
        }

        assert.strictEqual(tree.totalTriggers, numSingletons + numConjunctions);

        // Add disjunctions
        predicates.push(...conjunctions);
        const disjunctions = generator.generateDisjunctions(predicates, numDisjunctions, minClause, maxClause);
        for (const disjunction of disjunctions) {
            triggers.push(tree.addTrigger(disjunction.expression, disjunction.bindings));
        }

        assert.strictEqual(tree.totalTriggers, numSingletons + numConjunctions + numDisjunctions);

        const all = [...predicates];
        all.push(...disjunctions);

        // Add optionals
        const optionals = generator.generateOptionals(all, numOptionals, minClause, maxClause);
        for (const optional of optionals) {
            triggers.push(tree.addTrigger(optional.expression, optional.bindings));
        }

        assert.strictEqual(tree.totalTriggers, numSingletons + numConjunctions + numDisjunctions + numOptionals);

        // Add quantifiers
        const quantified = generator.generateQuantifiers(all, numQuantifiers, maxClause, maxExpansion, maxQuantifiers);
        for (const expr of quantified) {
            triggers.push(tree.addTrigger(expr.expression, expr.bindings, ...expr.quantifiers));
        }

        assert.strictEqual(tree.totalTriggers, numSingletons + numConjunctions + numDisjunctions + numOptionals + numQuantifiers);
        all.push(...quantified);

        const nots = generator.generateNots(all, numNots);
        for (const expr of nots) {
            triggers.push(tree.addTrigger(expr.expression, expr.bindings, ...expr.quantifiers));
        }

        assert.strictEqual(tree.totalTriggers, numSingletons + numConjunctions + numDisjunctions + numOptionals + numQuantifiers + numNots);
        all.push(...nots);

        verifyTree(tree);

        for (const predicate of predicates) {
            const memory = {};
            predicate.bindings.forEach((binding, key) => {
                const { value } = binding;
                memory[key] = value;
            });
            const matches = tree.matches(memory);

            // Clauses in every match must not generalize or specialize other matches
            for (let i = 0; i < matches.length; ++i) {
                const first = matches[i];
                for (let j = i + 1; j < matches.length; ++j) {
                    const second = matches[j];
                    let found = false;
                    for (const firstClause of first.clauses) {
                        const { value: match, error } = firstClause.tryEvaluate(memory);
                        if (!error && match) {
                            for (const secondClause of second.clauses) {
                                const { value: match2, error: error2 } = secondClause.tryEvaluate(memory);
                                if (!error2 && match2) {
                                    const reln = firstClause.relationship(secondClause, tree.comparers);
                                    if (reln === RelationshipType.equal || reln === RelationshipType.incomparable) {
                                        found = true;
                                        break;
                                    }
                                }
                            }

                            if (found) {
                                break;
                            }
                        }
                    }

                    assert(found);
                }
            }

        }

        // Delete triggers
        assert.strictEqual(tree.totalTriggers, triggers.length);

        for (const trigger of triggers) {
            tree.removeTrigger(trigger);
        }

        assert.strictEqual(tree.totalTriggers, 0);
        verifyTree(tree);
    }).timeout(5000);
});