// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.pokeclicker.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokeclicker.com
// @grant        none
// ==/UserScript==

(function () {
	'use strict';

	const DEFAULT_TIMESPAN = 5;
	const KANTO_RANKING = [
		130, 36, 103, 59, 40, 26, 143, 89, 131, 80, 126, 115, 55, 125, 127, 123, 110, 112, 128, 73, 38, 78, 97, 150, 121,
		134, 42, 87, 6, 68, 76, 3, 9, 149, 71, 114, 62, 31, 45, 146, 34, 119, 137, 91, 136, 142, 145, 35, 22, 108, 18, 49,
		144, 24, 57, 82, 139, 124, 85, 28, 99, 77, 141, 67, 47, 151, 94, 83, 70, 117, 44, 105, 135, 101, 20, 107, 2, 53, 75,
		106, 122, 58, 8, 5, 88, 65, 79, 25, 39, 111, 30, 17, 33, 93, 43, 109, 12, 61, 15, 54, 69, 86, 102, 66, 148, 1, 96,
		51, 29, 48, 7, 104, 74, 118, 4, 64, 120, 132, 138, 140, 46, 72, 56, 81, 84, 133, 32, 37, 100, 23, 90, 27, 60, 92,
		98, 116, 21, 95, 52, 16, 147, 41, 19, 63, 10, 13, 129, 14, 113, 11, 50,
	];
	const AUTOCLICKER_ADDBTN_ID = 'AUTOCLICKER_ADDBTN_ID';
	let autoClickerActivated = false;
	let clickerInterval;

	function log(message) {
		const date = new Date();
		const formatDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
		const formatTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
		const logStyle = 'color: #D00; font-weight: bold;';
		console.log(`[${formatDate} ${formatTime}] ` + `%cAutoClicker: ${message}.`, logStyle);
	}

	function triggerAutoClick(event) {
		autoClickerActivated = !autoClickerActivated;
		event.srcElement.innerHTML = autoClickerActivated ? 'On' : 'Off';
		event.srcElement.style.color = autoClickerActivated ? '#3F1' : '#FFF';
		clearInterval(clickerInterval);
		log(autoClickerActivated ? `started at ${1000 / DEFAULT_TIMESPAN} click/sec` : `stopped`);
		if (autoClickerActivated) {
			clickerInterval = setInterval(() => autoClick(event), DEFAULT_TIMESPAN);
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

	function setUpRanking(event) {
		const nodes = document.querySelectorAll('#breeding-pokemon li');

		for (let node of nodes) {
			const src = node.querySelector('img').src;
			let pokemonNumber = parseInt(/\/(\d+)\.png/.exec(src)[1]);
			const pokemonRank = KANTO_RANKING.indexOf(parseInt(pokemonNumber)) + 1;
			const nodeTitle = node.querySelector('span');
			nodeTitle.innerHTML = `${nodeTitle.innerHTML} <b>#${pokemonRank}</b>`;
		}

		if (nodes.length) {
			document.querySelector(`#${AUTOCLICKER_ADDBTN_ID}`).remove();
			log(`${nodes.length} breed ranks successfully added`);
		} else {
			event.srcElement.style.color = '#F31';
			log(`OPEN BREEDING LIST ONCE FIRST !`);
		}
	}

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
	addBtn.innerHTML = 'Add';
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
	autoBtn.innerHTML = 'Off';
	autoBtn.style.cssText = `
        padding: 6px 16px;
        border: none;
        border-radius: 6px;
        background-color: #555;
        font-family: pokemonFont,"Helvetica Neue",sans-serif;
        font-size: 16px;
        color: #FFF;
	`;
	autoBtn.onclick = (event) => triggerAutoClick(event);
	mainDiv.append(autoBtn);
})();
