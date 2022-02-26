// ==UserScript==
// @name         Siplus - ação
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Exibi número da atividade no Sistema e facilita processo de cópia colocando no ClipBoard
// @author       You
// @match        http://webapps.sorocaba.sescsp.org.br/siplan/*
// @grant        non

// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant       GM_addStyle
// ==/UserScript==
/*- The @grant directive is needed to work around a design change
    introduced in GM 1.0.   It restores the sandbox.
*/
// ==/UserScript==

waitForKeyElements ("#modal-title", exibirNumero);

function exibirNumero (jNode) {
    'use strict';

    //Get Activity Number
    var adress = window.location.href;
    var patt = /96\d{12}/i;
    var res = patt.exec(adress);

    // Inserir Número de Atividade
    var n = document.getElementById("titulo-projeto");

    var ativ = document.createElement("p");
    ativ.innerHTML = '<input type="text" value="' + res + '" id="myInput" style="border:0px;font-size:10px;margin-left:-.5em;">';
    var myInput = document.getElementById("myInput");
    //n.insertBefore(ativ, n.firstChild);
    n.appendChild(ativ);

//Função de copiar para ClipBoard
    ativ.addEventListener('click', function() {
        //Copy text from input field to clipboard
        var copyText = document.getElementById("myInput");
        copyText.select();
        document.execCommand("copy");
    }, false);
}

