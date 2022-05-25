'use strict';

const MS_SECOND = 1000;
const DUNGEON_TIMESPAN = MS_SECOND / 50;
const BREED_TIMESPAN = MS_SECOND;
const CLICK_TIMESPAN = MS_SECOND / 500;
const MAX_BREED_QUEUE = 2;

const COLORS = {
	WHITE: '#FFF',
	GREEN: '#3F1',
	ORANGE: '#F81',
	RED: '#F31',
};
const DOM_IDS = {
	MAIN_DIV: 'POKEMON_ADDIN_MAIN_DIV',
	DOCK_BTN: 'DOCK_BTN',
	AUTO_BTN: 'AUTO_BTN',
	DUNGEON_BTN: 'DUNGEON_BTN',
};
const BTN_STYLE = `
	margin-right: 6px;
	padding: 6px 16px;
	border: none;
	border-radius: 6px;
	background-color: #555;
	font-family: pokemonFont,"Helvetica Neue",sans-serif;
	font-size: 16px;
	color: #FFF;
`;
let autoBreedActivated = false;
let autoClickerActivated = false;
let autoDungeonClearActivated = false;
let averageDungeonClearSteps;
let breedInterval, clickInterval;

function log(message, color = COLORS.ORANGE) {
	const date = new Date();
	const formatDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	const formatTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	const logStyle = `color: ${color}; font-weight: bold;`;
	console.log(`[${formatDate} ${formatTime}] %c${message}.`, logStyle);
}

function btnColorTimeout(button, color = COLORS.RED) {
	button.style.color = color;
	setTimeout(() => {
		button.style.color = COLORS.WHITE;
	}, MS_SECOND * 5);
}

function hasClass(elem, className) {
	return elem.className.indexOf(className) >= 0;
}

function triggerClick(elem) {
	// inib error
	return elem ? elem.click() : null;
}

function autoBreed() {
	const nodes = document.querySelectorAll('#breeding-pokemon li.eggSlot:not(.disabled)');
	if (!nodes.length) {
		return COLORS.RED;
	}
	if (document.querySelectorAll('#hatcheryQueue div').length >= MAX_BREED_QUEUE) {
		return COLORS.ORANGE;
	}
	// search the first visible pokemon
	for (let node of nodes) {
		if (node.style.display !== 'none') {
			triggerClick(node.querySelector('a.overlay'));
			return COLORS.GREEN;
		}
	}
}

function triggerAutoBreed(btn) {
	autoBreedActivated = !autoBreedActivated;
	btn.style.color = autoBreedActivated ? COLORS.GREEN : COLORS.WHITE;
	clearInterval(breedInterval);
	log(autoBreedActivated ? `[Auto Breed] Start at ${MS_SECOND / BREED_TIMESPAN} breed/sec` : `stopped`);
	if (autoBreedActivated) {
		breedInterval = setInterval(() => {
			btn.style.color = autoBreed();
		}, BREED_TIMESPAN);
		btn.style.color = autoBreed();
	}
}

function triggerAutoClick(btn) {
	autoClickerActivated = !autoClickerActivated;
	btn.style.color = autoClickerActivated ? COLORS.GREEN : COLORS.WHITE;
	clearInterval(clickInterval);
	if (autoClickerActivated) {
		clickInterval = setInterval(
			() => triggerClick(document.querySelector('#battleContainer img.enemy')),
			CLICK_TIMESPAN
		);
	}
	log(autoClickerActivated ? `[Auto Click] Start at ${MS_SECOND / CLICK_TIMESPAN} click/sec` : `stopped`);
}

function stopDungeonClear(btn, error = null) {
	if (error) {
		log(`[Dungeon Clear] ${error}`);
	}
	autoDungeonClearActivated = false;
	return btnColorTimeout(btn);
}

function waitForBossToEnd(btn) {
	setTimeout(
		() =>
			document.querySelector('#battleContainer img.enemy, #battleContainer img.pokeball-animated')
				? waitForBossToEnd(btn)
				: startDungeonClear(btn),
		DUNGEON_TIMESPAN
	);
}

function startDungeonBoss(btn, bossTile, steps) {
	bossTile.click();
	const bossBtn = document.querySelector('#battleContainer button.dungeon-button');
	if (bossBtn) {
		averageDungeonClearSteps.push(steps);
		const rawAverage = averageDungeonClearSteps.reduce((a, b) => a + b, 0) / averageDungeonClearSteps.length;
		const average = Math.round(rawAverage * 10) / 10;
		log(`[Dungeon Clear] Boss found in ${steps} step(s)`, COLORS.GREEN);
		log(`[Dungeon Clear] Average steps: ${average} (count: ${averageDungeonClearSteps.length})`);
		btn.style.color = COLORS.ORANGE;
		bossBtn.click();
		return waitForBossToEnd(btn);
	}
	setTimeout(() => startDungeonBoss(btn, bossTile, steps), DUNGEON_TIMESPAN);
}

function autoDungeonClear(btn, tiles, steps = 0, pos = tiles.length - Math.floor(Math.sqrt(tiles.length) / 2) - 1) {
	// process only when no enemy
	if (!document.querySelector('#battleContainer img.enemy, #battleContainer img.pokeball-animated')) {
		const bossTile = document.querySelector('#dungeonMap td.tile-boss');
		if (bossTile) {
			return startDungeonBoss(btn, bossTile, steps);
		}
		const sideSize = Math.sqrt(tiles.length);
		const nextPos = [1, -sideSize, -1, sideSize];
		const cardinalTiles = [
			pos + 1 < tiles.length && (pos + 1) % sideSize ? tiles[pos + 1] : null,
			pos - sideSize >= 0 ? tiles[pos - sideSize] : null,
			pos - 1 >= 0 && pos % sideSize ? tiles[pos - 1] : null,
			pos + sideSize < tiles.length ? tiles[pos + sideSize] : null,
		];
		let index = 0;
		let nextTile = cardinalTiles.find((tile, i) => {
			index = i;
			return tile && !hasClass(tile, 'tile-visited');
		});
		if (!nextTile) {
			log(`[Dungeon Clear] No adjacent tile finding new unvisited tile`, COLORS.ORANGE);
			nextTile = document.querySelector('#dungeonMap td.tile-invisible');
			if (!nextTile) {
				return stopDungeonClear(btn, 'Error: no new unvisited tile found');
			}
			pos = tiles.findIndex(nextTile);
		} else {
			pos += nextPos[index];
		}
		nextTile.click();
		steps += 1;
	}
	setTimeout(() => autoDungeonClear(btn, tiles, steps, pos), DUNGEON_TIMESPAN);
}

function startDungeonClear(btn) {
	btn.style.color = COLORS.WHITE;
	if (!autoDungeonClearActivated) return;
	const dungeonStartBtn = document.querySelector('#townView button.btn-success');
	if (dungeonStartBtn) {
		btn.style.color = COLORS.GREEN;
		dungeonStartBtn.click();
		setTimeout(() => {
			const tiles = document.querySelectorAll('#dungeonMap td');
			if (tiles && tiles.length) {
				autoDungeonClear(btn, tiles);
			} else {
				stopDungeonClear(btn, 'Error: no map found');
			}
		}, DUNGEON_TIMESPAN);
	} else {
		stopDungeonClear(btn, 'Error: no dungeon button found');
	}
}

function triggerDungeonClear(btn) {
	averageDungeonClearSteps = [];
	autoDungeonClearActivated = !autoDungeonClearActivated;
	startDungeonClear(btn);
}

function addDockShortcut() {
	if (document.querySelector(`button#${DOM_IDS.DOCK_BTN}`)) return 0;

	const dockShortcutHtml = `<tr><td class="p-0"><button id="${DOM_IDS.DOCK_BTN}" class="btn btn-block btn-info m-0">Dock</button></td></tr>`;
	const shortcutTable = document.querySelector('#shortcutsBody > table > tbody');
	shortcutTable.innerHTML = shortcutTable.innerHTML + dockShortcutHtml;
	shortcutTable.querySelector(`#${DOM_IDS.DOCK_BTN}`).onclick = (event) => {
		document.querySelector('[data-town=Dock]').dispatchEvent(new Event('click'));
	};
	return 1;
}

function startTryAddDockShortcut() {
	const interval = setInterval(() => {
		if (addDockShortcut()) {
			log('[Base Addin] Dock shortcut added');
			clearInterval(interval);
		}
	}, MS_SECOND);
}

function main() {
	// MAIN DIV
	const mainDiv = document.createElement('div');
	mainDiv.id = DOM_IDS.MAIN_DIV;
	mainDiv.style.cssText = `
        position: absolute;
        top: 0;
        right: 180px;
	`;
	document.body.appendChild(mainDiv);

	// DUNGEON BTN
	const dungBtn = document.createElement('button');
	dungBtn.id = DOM_IDS.AUTO_BTN;
	dungBtn.innerHTML = 'Clear';
	dungBtn.style.cssText = BTN_STYLE;
	dungBtn.onclick = (event) => triggerDungeonClear(event.target);
	mainDiv.append(dungBtn);

	// BREED BTN
	const breedBtn = document.createElement('button');
	breedBtn.innerHTML = 'Breed';
	breedBtn.style.cssText = BTN_STYLE;
	breedBtn.onclick = (event) => triggerAutoBreed(event.target);
	mainDiv.append(breedBtn);

	// AUTO BTN
	const autoBtn = document.createElement('button');
	autoBtn.id = DOM_IDS.AUTO_BTN;
	autoBtn.innerHTML = 'Click';
	autoBtn.style.cssText = BTN_STYLE;
	autoBtn.onclick = (event) => triggerAutoClick(event.target);
	mainDiv.append(autoBtn);

	log('[Base Addin] Pokeclicker Addin loaded');

	startTryAddDockShortcut();
}

main();
