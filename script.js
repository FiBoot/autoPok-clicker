'use strict';

const MS_SECOND = 1000;
const CLICK_TIMESPAN = MS_SECOND / 50;
const DUNGEON_TIMESPAN = MS_SECOND / 10;
const BREED_TIMESPAN = MS_SECOND / 5;
const MAX_BREED_QUEUE = 2;
const GYM_MAX_NUMBER = 5;

const COLORS = {
	WHITE: '#FFF',
	GREEN: '#3F1',
	ORANGE: '#F81',
	RED: '#F31',
};
const DOM_IDS = {
	MAIN_DIV: 'POKEMON_ADDIN_MAIN_DIV',
	DOCK_BTN: 'DOCK_BTN',
	DUNGEON_COUT: 'DUNGEON_COUT',
	GYM_SELECT: 'GYM_SELECT',
	DUNGEON_BTN: 'DUNGEON_BTN',
	AUTO_BTN: 'AUTO_BTN',
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
let dungeonCount = 100,
	selectedGym = 1;
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
	log(`[Auto Breed] ${autoBreedActivated ? `Start at ${MS_SECOND / BREED_TIMESPAN} breed/sec` : `stopped`}`);
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
		log(`[Dungeon Clear] Error: ${error}`, COLORS.RED);
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
		const average = Math.round(rawAverage * 100) / 100;
		log(`[Dungeon Clear] Boss found in ${steps} step(s)`, COLORS.GREEN);
		log(`[Dungeon Clear] Average steps: ${average} (count: ${averageDungeonClearSteps.length})`);
		btn.style.color = COLORS.ORANGE;
		bossBtn.click();
		return waitForBossToEnd(btn);
	}
	setTimeout(() => startDungeonBoss(btn, bossTile, steps), DUNGEON_TIMESPAN);
}

function autoDungeonClear(btn, tiles, calc, steps = 0) {
	if (!document.querySelector('#dungeonMap')) return stopDungeonClear(btn, 'map not found');
	// process only when no enemy
	if (!document.querySelector('#battleContainer img.enemy, #battleContainer img.pokeball-animated')) {
		// try finding boss tile
		const bossTile = document.querySelector('#dungeonMap td.tile-boss');
		if (bossTile) return startDungeonBoss(btn, bossTile, steps);
		// calc next tile
		if (calc.y > 0) {
			calc.y -= 1;
		} else {
			calc.y = calc.side - 1;
			if (calc.x > 0) {
				calc.x += calc.dir;
			} else {
				calc.x = Math.floor(calc.side / 2) + 1;
				calc.dir = 1;
			}
		}
		let pos = calc.y * calc.side + calc.x;
		if (pos >= tiles.length) {
			log('[Dungeon Clear] No new unvisited tile found, going topleft', COLORS.RED);
			pos = 0;
		}
		triggerClick(tiles[pos]);
		steps += 1;
	}
	setTimeout(() => autoDungeonClear(btn, tiles, calc, steps));
}

function autoGymClear(btn) {
	if (!document.querySelector('#battleContainer #gymGoContainer')) {
		return startDungeonClear(btn);
	}
	setTimeout(() => autoGymClear(btn), DUNGEON_TIMESPAN);
}

function startDungeonClear(btn) {
	btn.style.color = COLORS.WHITE;
	document.querySelector(`#${DOM_IDS.MAIN_DIV} #${DOM_IDS.DUNGEON_COUT}`).value = dungeonCount;
	if (!autoDungeonClearActivated) return;
	if (dungeonCount-- < 1) {
		autoDungeonClearActivated = false;
		return log('[Dungeon Clear] Count is depleted, stopping');
	}
	const dungeonStartBtn =
		document.querySelector(`#townView .btn-block:nth-child(${selectedGym + 1}) button.btn-success`) ||
		document.querySelector('#townView .list-group button.btn-success');
	if (dungeonStartBtn) {
		btn.style.color = COLORS.GREEN;
		dungeonStartBtn.click();
		setTimeout(() => {
			const tiles = document.querySelectorAll('#dungeonMap td');
			if (tiles && tiles.length) {
				const side = Math.sqrt(tiles.length);
				const calc = { side, x: side - Math.ceil(side / 2), y: side - 1, dir: -1 };
				autoDungeonClear(btn, tiles, calc);
			} else if (document.querySelector('#battleContainer #gymGoContainer')) {
				autoGymClear(btn);
			} else {
				log('[Dungeon Clear] Map not found, restarting..', COLORS.RED);
				startDungeonClear(btn);
			}
		});
	} else {
		stopDungeonClear(btn, 'no dungeon button found');
	}
}

function triggerDungeonClear(btn) {
	averageDungeonClearSteps = [];
	autoDungeonClearActivated = !autoDungeonClearActivated;
	dungeonCount = dungeonCount < 1 ? 1 : dungeonCount || 1;
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

	// DUNGEON COUNT
	const dungCout = document.createElement('input');
	dungCout.id = DOM_IDS.DUNGEON_COUT;
	dungCout.type = 'number';
	dungCout.value = dungeonCount;
	dungCout.innerHTML = 'Clear';
	dungCout.style.cssText = BTN_STYLE + `width: 100px;`;
	dungCout.onchange = (event) => (dungeonCount = parseInt(event.target.value));
	mainDiv.append(dungCout);

	// DUNGEON BTN
	const dungBtn = document.createElement('button');
	dungBtn.id = DOM_IDS.DUNGEON_BTN;
	dungBtn.innerHTML = 'Clear';
	dungBtn.style.cssText = BTN_STYLE;
	dungBtn.onclick = (event) => triggerDungeonClear(event.target);
	mainDiv.append(dungBtn);

	// GYM SELECT
	const gymSelect = document.createElement('select');
	gymSelect.id = DOM_IDS.GYM_SELECT;
	gymSelect.style.cssText = BTN_STYLE;
	gymSelect.onclick = (event) => (selectedGym = parseInt(event.target.value));
	mainDiv.append(gymSelect);
	for (let i = 1; i <= GYM_MAX_NUMBER; i++) {
		const opt = document.createElement('option');
		opt.value = i;
		opt.innerHTML = i;
		gymSelect.append(opt);
	}

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
