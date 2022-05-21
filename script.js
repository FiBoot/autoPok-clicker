'use strict';

const COLORS = {
	WHITE: '#FFF',
	GREEN: '#3F1',
	ORANGE: '#F81',
	RED: '#F31',
};
const DOM_IDS = {
	MAIN_DIV: 'POKEMON_ADDIN_MAIN_DIV',
	AUTO_BTN: 'AUTO_BTN',
	TURBO_BTN: 'TURBO_BTN',
	DOCK_BTN: 'DOCK_BTN',
};
const CLICK_TIMESPAN = 2;
const BREED_TIMESPAN = 1000;
const MAX_CLICK_INTERVAL_COUNT = 10;
let autoBreedActivated = false;
let autoClickerActivated = false;
let breedInterval, clickInterval;

function log(message, color = COLORS.ORANGE) {
	const date = new Date();
	const formatDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	const formatTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	const logStyle = `color: ${color}; font-weight: bold;`;
	console.log(`[${formatDate} ${formatTime}] %c${message}.`, logStyle);
}

function triggerClick(elem) {
	// inib error
	if (!elem) return; // log(`Error: element not found for click`, COLORS.RED);
	elem.click();
}

function triggerAutoBreed(event) {
	autoBreedActivated = !autoBreedActivated;
	event.srcElement.style.color = autoBreedActivated ? COLORS.GREEN : COLORS.WHITE;
	clearInterval(breedInterval);
	log(autoBreedActivated ? `Auto-breed start at ${1000 / BREED_TIMESPAN} breed/sec` : `stopped`);
	if (autoBreedActivated) {
		breedInterval = setInterval(() => {
			const nodes = document.querySelectorAll('#breeding-pokemon li.eggSlot:not(.disabled)');
			if (!nodes.length) {
				event.srcElement.style.color = COLORS.RED;
			}
			// search the first visible pokemon
			for (let node of nodes) {
				if (node.style.display !== 'none') {
					event.srcElement.style.color = COLORS.GREEN;
					return triggerClick(node.querySelector('a.overlay'));
				}
			}
		}, BREED_TIMESPAN);
	}
}

function triggerAutoClick(event) {
	autoClickerActivated = !autoClickerActivated;
	event.srcElement.style.color = autoClickerActivated ? COLORS.GREEN : COLORS.WHITE;
	clearInterval(clickInterval);
	if (autoClickerActivated) {
		clickInterval = setInterval(
			() => triggerClick(document.querySelector('#battleContainer img.enemy')),
			CLICK_TIMESPAN
		);
	}
	log(autoClickerActivated ? `Auto-click start at ${1000 / CLICK_TIMESPAN} click/sec` : `stopped`);
}

function setPokemonRank(node, rank) {
	const span = node.querySelector('span');
	const matches = /^([\w() \-]+)( #)?/.exec(span.innerHTML);
	if (matches && matches.length > 1) {
		span.innerHTML = `${matches[1]} <b style="color: ${COLORS.GREEN}">#${rank}</b>`;
	}
}

function addDockShortcut() {
	if (document.querySelector(`button#${DOM_IDS.DOCK_BTN}`)) return;

	const dockShortcutHtml = `<tr><td class="p-0"><button id="${DOM_IDS.DOCK_BTN}" class="btn btn-block btn-info m-0">Dock</button></td></tr>`;
	const shortcutTable = document.querySelector('#shortcutsBody > table > tbody');
	shortcutTable.innerHTML = shortcutTable.innerHTML + dockShortcutHtml;
	shortcutTable.querySelector(`#${DOM_IDS.DOCK_BTN}`).onclick = (event) => {
		document.querySelector('[data-town=Dock]').dispatchEvent(new Event('click'));
	};
}

function setUpRanking(event) {
	const nodes = document.querySelectorAll('#breeding-pokemon li');
	for (const node of nodes) {
		const src = node.querySelector('img').src;
		const matches = /\/(\d+\.\d+)\.png$/.exec(src) || /\/(\d+)\.png$/.exec(src);
		const pokemonNumber = matches && matches.length > 1 ? matches[1] : 0;
		const pokemonRank = POKEMON_RANKING.indexOf(pokemonNumber) + 1;
		if (pokemonRank > 0) {
			setPokemonRank(node, pokemonRank);
		}
	}

	if (nodes.length) {
		event.srcElement.innerHTML = nodes.length;
		event.srcElement.style.color = COLORS.GREEN;
		setTimeout(() => {
			event.srcElement.innerHTML = 'Rank';
			event.srcElement.style.color = COLORS.WHITE;
		}, 1000 * 5); // 5 sec
		log(`${nodes.length} ranks successfully added`);
	} else {
		event.srcElement.style.color = COLORS.RED;
		log(`Can't find list -> Open Hatchery List once first !`);
	}
}

function main() {
	const btnStyle = `
		margin-right: 6px;
		padding: 6px 16px;
		border: none;
		border-radius: 6px;
		background-color: #555;
		font-family: pokemonFont,"Helvetica Neue",sans-serif;
		font-size: 16px;
		color: #FFF;
	`;

	// MAIN DIV
	const mainDiv = document.createElement('div');
	mainDiv.id = DOM_IDS.MAIN_DIV;
	mainDiv.style.cssText = `
        position: absolute;
        top: 0;
        right: 180px;
	`;
	document.body.appendChild(mainDiv);

	// RANK BTN
	const rankBtn = document.createElement('button');
	rankBtn.innerHTML = 'Rank';
	rankBtn.style.cssText = btnStyle;
	rankBtn.onclick = (event) => {
		addDockShortcut();
		setUpRanking(event);
	};
	mainDiv.append(rankBtn);

	// BREED BTN
	const breedBtn = document.createElement('button');
	breedBtn.innerHTML = 'Breed';
	breedBtn.style.cssText = btnStyle;
	breedBtn.onclick = (event) => triggerAutoBreed(event);
	mainDiv.append(breedBtn);

	// AUTO BTN
	const autoBtn = document.createElement('button');
	autoBtn.id = DOM_IDS.AUTO_BTN;
	autoBtn.innerHTML = 'Auto';
	autoBtn.style.cssText = btnStyle;
	autoBtn.onclick = (event) => triggerAutoClick(event);
	mainDiv.append(autoBtn);

	log('Pokeclicker Addin loaded');
}

main();
