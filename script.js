'use strict';

// const RANK_COLORS = ['#DFFF00', '#DFFF00', '#FF7F50', '#DE3163', '#9FE2BF', '#40E0D0', '#6495ED', '#CCCCFF'];
const KANTO_RANKING = [
	130, 36, 103, 59, 40, 26, 143, 89, 131, 80, 126, 115, 55, 125, 127, 123, 110, 112, 128, 73, 38, 78, 97, 150, 121, 134,
	42, 87, 6, 68, 76, 3, 9, 149, 71, 114, 62, 31, 45, 146, 34, 119, 137, 91, 136, 142, 145, 35, 22, 108, 18, 49, 144, 24,
	57, 82, 139, 124, 85, 28, 99, 77, 141, 67, 47, 151, 94, 83, 70, 117, 44, 105, 135, 101, 20, 107, 2, 53, 75, 106, 122,
	58, 8, 5, 88, 65, 79, 25, 39, 111, 30, 17, 33, 93, 43, 109, 12, 61, 15, 54, 69, 86, 102, 66, 148, 1, 96, 51, 29, 48,
	7, 104, 74, 118, 4, 64, 120, 132, 138, 140, 46, 72, 56, 81, 84, 133, 32, 37, 100, 23, 90, 27, 60, 92, 98, 116, 21, 95,
	52, 16, 147, 41, 19, 63, 10, 13, 129, 14, 113, 11, 50,
];
const JOHTO_RANKING = [
	233, 217, 199, 234, 224, 232, 203, 184, 229, 241, 206, 214, 160, 181, 210, 250, 230, 164, 169, 248, 221, 171, 157,
	211, 192, 244, 195, 154, 186, 212, 205, 226, 178, 168, 182, 176, 222, 198, 249, 243, 245, 208, 200, 162, 185, 227,
	197, 193, 251, 196, 219, 207, 159, 237, 215, 202, 153, 156, 216, 240, 180, 231, 190, 239, 189, 228, 247, 170, 209,
	166, 158, 225, 152, 177, 155, 179, 201, 204, 223, 173, 174, 188, 167, 163, 238, 218, 183, 175, 246, 242, 220, 161,
	165, 187, 172, 194, 236, 235, 191, 213,
];
const AUTOCLICKER_ADDBTN_ID = 'AUTOCLICKER_ADDBTN_ID';
let autoClickerActivated = false;
let clickerInterval;

function log(message) {
	const date = new Date();
	const formatDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	const formatTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	const logStyle = 'color: #F81; font-weight: bold;';
	console.log(`[${formatDate} ${formatTime}] ` + `%cAutoClicker: ${message}.`, logStyle);
}

function triggerAutoClick(event, timespan) {
	autoClickerActivated = !autoClickerActivated;
	event.srcElement.style.color = autoClickerActivated ? '#3F1' : '#FFF';
	clearInterval(clickerInterval);
	log(autoClickerActivated ? `started at ${1000 / timespan} click/sec` : `stopped`);
	if (autoClickerActivated) {
		clickerInterval = setInterval(() => autoClick(event, timespan), timespan);
	}
}

function autoClick(event) {
	try {
		document.querySelector('img.enemy').click();
	} catch (error) {
		// log(`error: ${error.message}`);
		// triggerAutoClick(event);
	}
}

function setPokemonRank(node, rank, color) {
	const span = node.querySelector('span');
	const matches = /^([\w() \-]+)( #)?/.exec(span.innerHTML);
	if (matches && matches.length > 1) {
		span.innerHTML = `${matches[1]} <b style="color: ${color}">#${rank}</b>`;
	}
}

function setUpRanking(event) {
	const nodes = document.querySelectorAll('#breeding-pokemon li');

	for (let node of nodes) {
		const src = node.querySelector('img').src;
		const matches = /\/(\d+)\.png$/.exec(src);

		let pokemonNumber = matches && matches.length > 1 ? parseInt(matches[1]) : 0;
		let pokemonRank;
		let rankColor;

		if (pokemonNumber <= KANTO_RANKING.length) {
			rankColor = '#DFFF00';
			pokemonRank = KANTO_RANKING.indexOf(parseInt(pokemonNumber)) + 1;
		} else if (pokemonNumber <= KANTO_RANKING.length + JOHTO_RANKING.length) {
			rankColor = '#FFBF00';
			pokemonRank = JOHTO_RANKING.indexOf(parseInt(pokemonNumber)) + 1;
		}

		if (pokemonRank > 0) {
			setPokemonRank(node, pokemonRank, rankColor);
		}
	}

	if (nodes.length) {
		event.srcElement.style.color = '#3F1';
		setTimeout(() => {
			event.srcElement.style.color = '#FFF';
		}, 1000 * 5); // 5sec
		log(`${nodes.length} rank successfully added`);
	} else {
		event.srcElement.style.color = '#F31';
		log(`OPEN BREEDING LIST ONCE FIRST !`);
	}
}

function main() {
	// MAIN DIV
	const mainDiv = document.createElement('div');
	mainDiv.style.cssText = `
        position: absolute;
        top: 0;
        right: 180px;
	`;
	document.body.appendChild(mainDiv);

	// ADD BTN
	const addBtn = document.createElement('button');
	addBtn.innerHTML = 'Rank';
	addBtn.id = AUTOCLICKER_ADDBTN_ID;
	addBtn.style.cssText = `
		margin-right: 6px;
        padding: 6px 16px;
        border: none;
        border-radius: 6px;
        background-color: #555;
        font-family: pokemonFont,"Helvetica Neue",sans-serif;
        font-size: 16px;
        color: #FFF;
	`;
	addBtn.onclick = (event) => setUpRanking(event);
	mainDiv.append(addBtn);

	// AUTO BTN
	const autoBtn = document.createElement('button');
	autoBtn.innerHTML = 'Auto';
	autoBtn.style.cssText = `
		margin-right: 6px;
        padding: 6px 16px;
        border: none;
        border-radius: 6px;
        background-color: #555;
        font-family: pokemonFont,"Helvetica Neue",sans-serif;
        font-size: 16px;
        color: #FFF;
	`;
	autoBtn.onclick = (event) => triggerAutoClick(event, 10);
	mainDiv.append(autoBtn);

	// TURBO BTN
	const turboBtn = document.createElement('button');
	turboBtn.innerHTML = 'TURBO';
	turboBtn.style.cssText = `
		margin-right: 6px;
        padding: 6px 16px;
        border: none;
        border-radius: 6px;
        background-color: #555;
        font-family: pokemonFont,"Helvetica Neue",sans-serif;
        font-size: 16px;
        color: #FFF;
	`;
	turboBtn.onclick = (event) => triggerAutoClick(event, 1);
	mainDiv.append(turboBtn);

	log(`component added`);
}
