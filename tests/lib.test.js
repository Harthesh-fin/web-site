import assert from "node:assert/strict";
import { test } from "node:test";

import { levelFor, progressPercent, rankFor, stageIndex } from "../site/lib.js";

test("no steps means 0%", () => {
	assert.equal(progressPercent(0, 0), 0);
});

test("3 of 4 steps is 75%", () => {
	assert.equal(progressPercent(3, 4), 75);
});

test("percent rounds to a whole number", () => {
	assert.equal(progressPercent(1, 3), 33);
});

test("percent stays between 0 and 100", () => {
	assert.equal(progressPercent(-2, 4), 0);
	assert.equal(progressPercent(9, 4), 100);
});

test("rocket starts on the first stage and ends on the last", () => {
	assert.equal(stageIndex(0, 6), 0);
	assert.equal(stageIndex(50, 6), 2);
	assert.equal(stageIndex(100, 6), 5);
});

test("rocket never leaves the map", () => {
	assert.equal(stageIndex(-10, 6), 0);
	assert.equal(stageIndex(150, 6), 5);
	assert.equal(stageIndex(50, 1), 0);
});

test("a new level every 25%, capped at 5", () => {
	assert.equal(levelFor(0), 1);
	assert.equal(levelFor(24), 1);
	assert.equal(levelFor(25), 2);
	assert.equal(levelFor(99), 4);
	assert.equal(levelFor(100), 5);
});

test("each level has a rank, from Wanderer to Legend", () => {
	assert.equal(rankFor(1), "Wanderer");
	assert.equal(rankFor(3), "Champion");
	assert.equal(rankFor(5), "Legend");
	assert.equal(rankFor(9), "Legend");
	assert.equal(rankFor(0), "Wanderer");
});
