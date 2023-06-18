// ==UserScript==
// @name         Redesign Sistemas Sesc
// @namespace    http://tampermonkey.net/
// @version      23.6.17
// @description  try to take over the world!
// @author       You
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      https://raw.githubusercontent.com/jeresig/jquery.hotkeys/master/jquery.hotkeys.js
// @require      https://js.jotform.com/JotForm.js
// @downloadURL https://github.com/melnic/siplus/raw/master/redesign.user.js
// @updateURL https://github.com/melnic/siplus/raw/master/redesign.user.js
// @grant        GM_addStyle

// @match        http://webapps.sorocaba.sescsp.org.br/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=org.br
// ==/UserScript==

(function() {
    'use strict';

    waitForKeyElements (".textododca", actionFunction);
    waitForKeyElements (".intrasesc-nav", ocultar);
    waitForKeyElements (".page-header", ocultar);
    waitForKeyElements ("#module-container > div > div > div.span10 > div:nth-child(2) > a", ajustarCalendario);
    //agenda-list

    waitForKeyElements ("#container-btn-filtros", ocultar);
    waitForKeyElements ("#agenda-box-informacoes", ocultar);

    function actionFunction (jNode) {
        jNode.css ("width", "300pt");
        jNode.css ("font-size", "12pt");
    }

    function ajustarCalendario(jNode){
        //jNode.css("margin-top", "5em");
        $('#module-container > div > div > div.span10').css("margin-top", "5em");
    }

        function ocultar (jNode) {
        jNode.hide();
    }

    JF.initialize( {apiKey: "305576062b46c14eb42b92e29e910e3e"} );
    //alert('formulários iniciados');
    
})();

