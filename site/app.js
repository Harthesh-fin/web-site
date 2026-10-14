import { levelFor, progressPercent, rankFor, stageIndex } from "./lib.js";

const KEY = "cicd-practice-steps";
const XP_PER_QUEST = 125;
const STEP_MS = 550;

const boxes = [...document.querySelectorAll("#steps input")];
const stages = [...document.querySelectorAll("#stages .stage")];
const world = document.getElementById("world");
const map = document.querySelector(".map");
const axe = document.getElementById("axe");
const bar = document.getElementById("bar");
const xpOut = document.getElementById("xp");
const levelOut = document.getElementById("level");
const rankOut = document.getElementById("rank");
const toast = document.getElementById("toast");
const victory = document.getElementById("victory");
const embers = document.getElementById("embers");
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let shownStage = 0;
let shownLevel = 1;
let goal = 0;
let timer = null;

function load() {
	try {
		return JSON.parse(localStorage.getItem(KEY)) || [];
	} catch {
		return [];
	}
}

function save() {
	try {
		localStorage.setItem(KEY, JSON.stringify(boxes.map((box) => box.checked)));
	} catch {
		// Storage blocked (private window): the quests still work, just not remembered.
	}
}

function restart(el, className) {
	el.classList.remove(className);
	void el.offsetWidth;
	el.classList.add(className);
}

function placeAxe(index, thrown) {
	shownStage = index;
	map.style.setProperty("--i", index);
	stages.forEach((stage, i) => {
		stage.classList.toggle("lit", i <= index);
		stage.classList.toggle("current", i === index);
	});
	if (!thrown) return;
	restart(axe, "flying");
	setTimeout(() => restart(stages[index].querySelector(".node"), "hit"), STEP_MS - 40);
}

// The axe is thrown one realm at a time so you see it travel the pipeline.
function step() {
	timer = null;
	if (calm || shownStage === goal) {
		placeAxe(goal, false);
		return;
	}
	placeAxe(shownStage + Math.sign(goal - shownStage), true);
	timer = setTimeout(step, STEP_MS);
}

function throwTo(index) {
	goal = index;
	if (!timer) step();
}

function say(message) {
	toast.textContent = message;
	if (message) restart(toast, "show");
}

function popXp(box) {
	const pop = document.createElement("span");
	pop.className = "xp-pop";
	pop.textContent = `+${XP_PER_QUEST} XP`;
	box.closest("li").append(pop);
	setTimeout(() => pop.remove(), 1000);
}

function spawnEmbers() {
	const sparks = Array.from({ length: 40 }, () => {
		const spark = document.createElement("span");
		spark.className = "ember";
		spark.style.setProperty("--x", `${Math.random() * 100}%`);
		spark.style.setProperty("--s", `${4 + Math.random() * 7}px`);
		spark.style.setProperty("--d", `${3 + Math.random() * 4}s`);
		spark.style.setProperty("--delay", `${Math.random() * 3}s`);
		spark.style.setProperty("--drift", `${(Math.random() - 0.5) * 160}px`);
		return spark;
	});
	embers.replaceChildren(...sparks);
}

function celebrate() {
	document.getElementById("victory-xp").textContent = boxes.length * XP_PER_QUEST;
	if (!calm) {
		spawnEmbers();
		restart(world, "quake");
	}
	// Let the axe land in Asgard before the victory screen.
	setTimeout(() => victory.showModal(), calm ? 0 : STEP_MS * 2);
}

function render(changed) {
	const done = boxes.filter((box) => box.checked).length;
	const percent = progressPercent(done, boxes.length);
	const level = levelFor(percent);

	bar.value = percent;
	bar.textContent = `${percent}%`;
	xpOut.textContent = done * XP_PER_QUEST;
	levelOut.textContent = level;
	rankOut.textContent = rankFor(level);
	map.classList.toggle("clear", percent === 100);

	if (changed) {
		if (changed.checked) popXp(changed);
		if (percent === 100) {
			say("Pipeline conquered. Your change is live.");
			celebrate();
		} else if (level > shownLevel) {
			say(`Rank up: ${rankFor(level)}.`);
		} else {
			say("");
		}
	}

	shownLevel = level;
	throwTo(stageIndex(percent, stages.length));
}

document.getElementById("xp-total").textContent = boxes.length * XP_PER_QUEST;

document.getElementById("victory-close").addEventListener("click", () => victory.close());

document.getElementById("victory-replay").addEventListener("click", () => {
	boxes.forEach((box) => {
		box.checked = false;
	});
	save();
	victory.close();
	render(null);
	say("A new quest begins.");
});

victory.addEventListener("close", () => embers.replaceChildren());

const saved = load();
boxes.forEach((box, i) => {
	box.checked = Boolean(saved[i]);
	box.addEventListener("change", () => {
		save();
		render(box);
	});
});

// Page load: the axe starts in Midgard, then flies to where you left off.
placeAxe(0, false);
setTimeout(() => render(null), calm ? 0 : 600);
