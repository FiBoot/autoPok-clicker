// ==UserScript==
// @name        [Pokeclicker] Catch Speed Adjuster
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @icon        https://www.google.com/s2/favicons?sz=64&domain=pokeclicker.com
// @grant       none
// @version     1.3
// @author      Ephenia
// @editor      FiBoot
// @description Adjusts catch speed of all Pokeballs. Currently only makes Pokeballs catch as fast as possible.
// ==/UserScript==

let ballAdjuster = 'false';
let defaultTime = [];

function initBallAdjust() {
	const getBalls = App.game.pokeballs.pokeballs;
	for (let i = 0; i < getBalls.length; i++) {
		defaultTime.push(getBalls[i].catchTime);
	}

	function catchDelay() {
		for (let i = 0; i < getBalls.length; i++) {
			getBalls[i].catchTime = ballAdjuster === '1' ? 0 : defaultTime[i];
		}
	}

	function changeAdjust(elem) {
		ballAdjuster = ballAdjuster === '1' ? '0' : '1';
		elem.style.color = ballAdjuster === '1' ? '#3F1' : '#FFF';
		localStorage.setItem('ballAdjuster', ballAdjuster);
		catchDelay();
	}

	const instantCaptureBtn = document.createElement('button');
	instantCaptureBtn.innerHTML = 'Instant Capture';
	instantCaptureBtn.style.cssText = `
        position: absolute;
        top: 0; left: 30px;
        margin-right: 6px;
        padding: 6px 16px;
        border: none;
        border-radius: 6px;
        background-color: #555;
        font-family: pokemonFont,"Helvetica Neue",sans-serif;
        font-size: 16px;
        color: #FFF;
    `;
	instantCaptureBtn.addEventListener('click', (event) => changeAdjust(event.target));
	document.body.appendChild(instantCaptureBtn);

	if (ballAdjuster == '1') {
		instantCaptureBtn.style.color = '#3F1';
		catchDelay();
	}
}

if (localStorage.getItem('ballAdjuster') == null) {
	localStorage.setItem('ballAdjuster', '0');
}
ballAdjuster = localStorage.getItem('ballAdjuster');

function loadScript() {
	const oldInit = Preload.hideSplashScreen;
	Preload.hideSplashScreen = function () {
		const result = oldInit.apply(this, arguments);
		initBallAdjust();
		return result;
	};
}

const scriptName = 'catchspeedadjuster';
if (document.getElementById('scriptHandler') !== undefined) {
	let scriptElement = document.createElement('div');
	scriptElement.id = scriptName;
	document.getElementById('scriptHandler').appendChild(scriptElement);
	if (localStorage.getItem(scriptName) !== null) {
		if (localStorage.getItem(scriptName) === '1') {
			loadScript();
		}
	} else {
		localStorage.setItem(scriptName, '1');
		loadScript();
	}
} else {
	loadScript();
}
