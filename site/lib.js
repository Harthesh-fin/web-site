// Pure logic lives here so CI can test it without a browser.
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const RANKS = ["Wanderer", "Warrior", "Champion", "Berserker", "Legend"];

export function progressPercent(done, total) {
	if (!Number.isFinite(total) || total <= 0) return 0;
	return Math.round((clamp(done, 0, total) / total) * 100);
}

// Which realm the axe sits on: 0% is the first realm, 100% the last.
export function stageIndex(percent, count) {
	if (count <= 1) return 0;
	return Math.floor((clamp(percent, 0, 100) * (count - 1)) / 100);
}

// Level 1 to 5: a new level every 25%.
export function levelFor(percent) {
	return Math.min(5, Math.floor(clamp(percent, 0, 100) / 25) + 1);
}

export function rankFor(level) {
	return RANKS[clamp(Math.round(level), 1, RANKS.length) - 1];
}
