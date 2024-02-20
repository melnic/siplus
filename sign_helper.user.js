// ==UserScript==
// @name         Assinar Contratos
// @namespace    http://tampermonkey.net/
// @version      24.02.20
// @description  try to take over the world!
// @author       You
// @match        https://na2.docusign.net/Signing/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      https://raw.githubusercontent.com/jeresig/jquery.hotkeys/master/jquery.hotkeys.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=docusign.net
// @downloadURL https://github.com/melnic/siplus/raw/master/sign_helper.user.js
// @updateURL   https://github.com/melnic/siplus/raw/master/sign_helper.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    waitForKeyElements ("#disclosureAccepted", actionFunction);
    waitForKeyElements ('button:contains("Adotar e assinar")', clicar);
    //button:contains("Adotar e assinar")'

    function clicar (jNode) {
        jNode.click();
    }

    function actionFunction (jNode) {
        jNode.click();
        $('#action-bar-btn-continue').click();
    }
    // Your code here...

    // function clicar (jNode) {
    //     //-- DO WHAT YOU WANT TO THE TARGETED ELEMENTS HERE.
    //     //alert('achei');
    //     jNode.click();
    //     //$('#action-bar-btn-continue').click();
    // }
    // //$('*[data-qa="adopt-submit"]');


})();
