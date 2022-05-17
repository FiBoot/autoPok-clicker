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

	var elem = document.createElement('div');
	elem.style.cssText = `
        position: absolute;
        top: 0;
        right: 180px;
	`;
	document.body.appendChild(elem);

	var btn = document.createElement('button');
	btn.innerHTML = 'Off';
	btn.style.cssText = `
        padding: 5px 16px;
        border: none;
        border-radius: 6px;
        background-color: #555;
        font-family: pokemonFont,"Helvetica Neue",sans-serif;
        font-size: 16px;
        color: #FFF;
	`;
	btn.onclick = (event) => triggerAutoClick(event);

	elem.append(btn);
})();
