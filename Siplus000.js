// ==UserScript==
// @name         Zap Tool
// @namespace    http://tampermonkey.net/
// @version      23.7.5
// @description  adiciona funcionalidades práticas ao Zap
// @author       You
// @match        https://web.whatsapp.com/
// @icon         https://www.google.com/s2/favicons?domain=whatsapp.com
// @downloadURL https://raw.githubusercontent.com/melnic/siplus/master/Siplus000.js
// @updateURL https://raw.githubusercontent.com/melnic/siplus/master/Siplus000.js
// @grant        none
// ==/UserScript==

// Dica sobre como rodar e editar user scripts
//https://stackoverflow.com/questions/41212558/develop-tampermonkey-scripts-in-a-real-ide-with-automatic-deployment-to-openuser


var phrases = {};
phrases.LABEL_NEW_CHAT_INPUT = 'Novo chat';
phrases.PLACEHOLDER_NEW_CHAT_INPUT = 'DD Número';
phrases.NEW_CHAT_INPUT_INVALID_NUMBER = 'Número inválido';

var countryCode = '55';
const WPPAPI = "https://api.whatsapp.com/send?phone=";

// Seleciona texto no ZAP
//var x = document.getElementsByClassName('selectable-text')[0];


(function() {
    'use strict';

    // Your code here...
    document.addEventListener('keyup', function (event) {
        if (event.altKey && event.key === 'n') {
            newChatWithNumberNotSaved();
        }
    });

})();

function newChatWithNumberNotSaved() {
    let main = document.getElementById('main');
    let newChatInput = document.getElementById("new-chat-input");
    if (!newChatInput) {
        let newChatContainer = document.createElement("div");
        newChatInput = document.createElement("input");
        let span = document.createElement("span");
        newChatContainer.id = "new-chat-container";
        span.setAttribute("role", "alert");
        newChatInput.setAttribute("type", "tel");
        newChatInput.id = "new-chat-input";
        newChatInput.setAttribute("aria-label", phrases.LABEL_NEW_CHAT_INPUT);
        newChatInput.setAttribute("placeholder", phrases.PLACEHOLDER_NEW_CHAT_INPUT);
        newChatInput.setAttribute("autocomplete", "off");
        let newChatInputStyle = "background-color: #EEE;width:100%;text-align:center;font-size:1.5em; border:none";

        newChatInput.setAttribute("style", newChatInputStyle);
        newChatInput.addEventListener("keydown", function (e) {
            if (e.keyCode == 13) {
                const reg = /^\d+$/;
                const r = /5?5?(\d+)/;
                const r2 = /\d+/g;

                var telefone = newChatInput.value;

                if (telefone.match(r)[1].length < 15){
                    telefone = telefone.replace(/\D/g,'');
                }else{
                    telefone = telefone.match(r)[1];
                }

                //console.log(telefone);

                //newChatInput.value(newChatInput.value.replace(/ /g, ""));

                //if ((newChatInput.value.length >= 9) && (telefone.test(reg))) {
                if (newChatInput.value.length >= 9) {

                    let link = document.createElement("a");

                    link.href = WPPAPI + countryCode + telefone;

                    //console.log(link.href);

                    newChatContainer.insertBefore(link, newChatContainer.firstChild);
                    link.click();
                    setTimeout(function () {
                        let errorElement = document.querySelector('[data-animate-modal-body="true"]');
                        if (errorElement && errorElement.firstChild.textContent.indexOf("url") != -1) {

                            errorElement.parentNode.parentNode.parentNode.setAttribute("hidden", "true");

                            newChatContainer.removeChild(link);
                            newChatInput.focus();
                            span.textContent = "";

                            setTimeout(function () {

                                span.textContent = phrases.NEW_CHAT_INPUT_INVALID_NUMBER;
                            }, 1000);

                        }
                        else {
                            newChatContainer.parentNode.removeChild(newChatContainer);
                            setTimeout(function () {
                                let conversationTitle = main.querySelector("header");
                                conversationTitle = conversationTitle ? conversationTitle.querySelector('[dir="auto"]') : "";
                                conversationTitle = conversationTitle ? conversationTitle.getAttribute("title") : "";

                                activeConversationTitle = conversationTitle;
                                document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 69, altKey: true }));
                            }, 500);

                        }
                    }, 500);


                }
                else {

                    span.textContent = "";
                    setTimeout(function () {

                        span.textContent = phrases.NEW_CHAT_INPUT_INCORRECT;
                    }, 100);


                }

            }
            if (e.keyCode == 27) {
                e.preventDefault();
                e.stopPropagation();
                newChatContainer.parentNode.removeChild(newChatContainer);
            }

        }, false);

        newChatContainer.appendChild(newChatInput);
        newChatContainer.appendChild(span);
        document.getElementById("pane-side").insertBefore(newChatContainer, document.getElementById("pane-side").firstChild);

    }
    setTimeout(function () {
        newChatInput.focus();
    }, 100);

}
