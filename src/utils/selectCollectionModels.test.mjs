import test from 'node:test';
import assert from 'node:assert/strict';
import { selectCollectionModels } from './selectCollectionModels.js';

const models = Array.from({ length: 5 }, (_, id) => ({
    id,
    options: ['green', 'navy', 'black', 'ivory', 'white'].map((colorName, color) => ({
        id: id * 5 + color, name: `Model ${id}`, colorName,
    })),
}));

test('home collection selects four distinct models and starting colors without changing catalog data', () => {
    const before = structuredClone(models);
    const selected = selectCollectionModels(models, 4, () => 0);
    assert.equal(selected.length, 4);
    assert.equal(new Set(selected.map(model => model.id)).size, 4);
    assert.equal(new Set(selected.map(model => model.options[0].colorName)).size, 4);
    assert.ok(selected.every(model => model.options.length === 5));
    assert.deepEqual(models, before);
});

test('random source changes model selection and initial colors', () => {
    assert.notDeepEqual(selectCollectionModels(models, 4, () => 0), selectCollectionModels(models, 4, () => 0.99));
});

test('small collections and shared colors still render all available models', () => {
    const result = selectCollectionModels([{ id: 0, options: [] }, ...models.slice(0, 2).map(model => ({
        ...model, options: [model.options[0]],
    }))]);
    assert.equal(result.length, 2);
    assert.ok(result.every(model => model.options[0].colorName === 'green'));
});
