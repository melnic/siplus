// ==UserScript==
// @name         PCAPer
// @namespace    http://tampermonkey.net/
// @version      2025.9.23
// @description  Melhorias de Laout e Funcionalidade
// @author       Você
// @match        *://*spcap*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //Remover colunas inuteis
    document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab' || event.keyCode === 9) {
        // Previne o comportamento padrão do Tab se necessário
        // event.preventDefault();

        // Executa seu código
        $('td:nth-child(4), th:nth-child(4)').toggle();
        $('td:nth-child(11), th:nth-child(11)').toggle();
        $('td:nth-child(12), th:nth-child(12)').toggle();
    }
});

    //Remove o Cabeçalho que ocupa muito espaço
    removerHeaderBranding();

    // Expander cores de status do PCAP
    aplicarBackground();

    // Remove Margem do topo da tabela, espaço inútil
    const elemento = document.querySelector('.t-Body-contentInner');

    // Aplica o margin-top
    if (elemento) {
        elemento.style.marginTop = '-40px';
    }

    function aplicarBackground() {
        document.querySelectorAll('td div[style*="background-color"]').forEach(div => {
            const td = div.closest('td');
            if (td) {
                const style = div.getAttribute('style');
                const match = style.match(/background-color\s*:\s*([^;]+)/);
                if (match) {
                    td.style.backgroundColor = match[1].trim();
                    div.style.backgroundColor = 'transparent';
                }
            }
        });
    }

    function removerHeaderBranding() {
        // Encontra o elemento pelo seletor de classe
        const elemento = document.querySelector('div.t-Header-branding');

        if (elemento) {
            // Remove o elemento do DOM
            elemento.remove();
            console.log('Elemento div.t-Header-branding removido com sucesso!');
            return true;
        }
        return false;
    }

    // Observa mudanças no DOM para remover elementos carregados dinamicamente
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    // Verifica se o próprio nó é o elemento a ser removido
                    if (node.matches && node.matches('div.t-Header-branding')) {
                        node.remove();
                        console.log('Elemento removido via MutationObserver');
                    }
                    // Verifica se contém o elemento em seus filhos
                    const elemento = node.querySelector ? node.querySelector('div.t-Header-branding') : null;
                    if (elemento) {
                        elemento.remove();
                        console.log('Elemento filho removido via MutationObserver');
                    }
                }
            });
        });
    });

    // Inicia a observação
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
