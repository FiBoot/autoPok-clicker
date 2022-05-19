// ==UserScript==
// @name         pokemonclick addin
// @namespace    http://tampermonkey.net/
// @version      2.4
// @author       FiBoot
// @match        https://www.pokeclicker.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokeclicker.com
// @grant        none
// @require      https://raw.githubusercontent.com/FiBoot/pokeclicker-addin/main/script.js
// ==/UserScript==

// TIMESPAN -> CLICK PER SECONDS
//  1       -> 1000
//  2       -> 500
//  4       -> 250
//  5       -> 200
//  8       -> 125
//  10      -> 100
const TIMESPAN = 2;

main();
