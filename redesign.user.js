// ==UserScript==
// @name         Redesign Sistemas Sesc
// @namespace    http://tampermonkey.net/
// @version      24.01.02
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

(function () {
    'use strict';

    var fechado = false;

    waitForKeyElements(".textododca", actionFunction);
    waitForKeyElements(".intrasesc-nav", ocultar);
    waitForKeyElements(".page-header", ocultar);
    waitForKeyElements("#module-container > div > div > div.span10 > div:nth-child(2) > a", ajustarCalendario);
    //agenda-list

    waitForKeyElements("#container-btn-filtros", ocultar);
    waitForKeyElements("#agenda-box-informacoes", ocultar);
    waitForKeyElements("#container-btn-filtros", ocultar);
    waitForKeyElements("#module-container > div > div.row-fluid > div.span10 > div:nth-child(1)", ocultar);

    waitForKeyElements('.navbar-inner', (Element)=>{
                //Edita Estilo do DIVs de ação
                
                let divs = $('.fc-event');
                divs.css('border-radius', '5px');
                divs.css('color', 'rgb(0 0 0 / 75%) "important');
                document.body.style.background = 'f3f3f3';
    })

    //Oculta o filtro da agenda
    waitForKeyElements("#container-filters-summary > div > div.box-title", toggleFilter);

    function toggleFilter(jNode) {
        // document.querySelector("#container-filters-summary > div > div.well.no-radius")
        // #container-filters-summary > div > div.box-title
        let d = $("#container-filters-summary > div > div.well.no-radius");
        d.toggle();
        jNode.on("click", function () {
            d.toggle();
        });
    }
    //waitForKeyElements ("#quadro-resumo-modal > div > div.modal-header > button > i", fechar);
    //#quadro-resumo-modal > div > div.modal-header > button > i

    function actionFunction(jNode) {
        jNode.css("width", "300pt");
        jNode.css("font-size", "12pt");
    }

    function ajustarCalendario(jNode) {
        //jNode.css("margin-top", "5em");
        $('#module-container > div > div > div.span10').css("margin-top", "5em");
    }

    function ocultar(jNode) {
        jNode.hide();
    }

    function fechar(jNode) {
        if (!fechado) {
            jNode.click();
            fechado = true;
        }
    }

    //alert('Teste de versão ok, versão 2');
})();
    }

    alert('Teste de versão ok, versão 2');    
})();

