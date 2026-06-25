// ==UserScript==
// @name         SESC Sorocaba - Botões Meses Atual e Futuros
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Adiciona botões para o mês atual e próximos 4 meses no calendário do SESC Sorocaba
// @author       Você
// @match        http://webapps.sorocaba.sescsp.org.br/siplan/*
// @downloadURL https://github.com/melnic/siplus/raw/refs/heads/master/menu_meses.user.js
// @updateURL   https://github.com/melnic/siplus/raw/refs/heads/master/menu_meses.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Adiciona CSS para reduzir a largura dos selects
    const style = document.createElement('style');
    style.textContent = `
        #select-month {
            width: 100px !important;
            max-width: 100px !important;
        }
        #select-year {
            width: 70px !important;
            max-width: 70px !important;
        }
        #select-month-container {
            display: inline-flex !important;
            gap: 5px !important;
            align-items: center !important;
        }
        .btn-mes-rapido.atual {
            font-weight: bold;
            background-color: #f0f0f0;
            border: 2px solid #ccc;
        }
    `;
    document.head.appendChild(style);

    const MESES = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    function calcularMesAno(offset) {
        const dataAtual = new Date();
        const mesAtual = dataAtual.getMonth(); // 0-11
        const anoAtual = dataAtual.getFullYear();

        let novoMes = mesAtual + offset;
        let novoAno = anoAtual;

        if (novoMes >= 12) {
            novoAno += Math.floor(novoMes / 12);
            novoMes = novoMes % 12;
        }

        return { mes: MESES[novoMes], ano: novoAno };
    }

    function getNomeMesSistema(offset) {
        return calcularMesAno(offset).mes.substring(0, 3);
    }

    function navegarParaMesSistema(offset) {
        const selectMes = document.querySelector('#select-month');
        const selectAno = document.querySelector('#select-year');

        if (!selectMes || !selectAno) {
            console.error('[SESC botões] Elementos de seleção não encontrados ao navegar');
            return;
        }

        const { mes, ano } = calcularMesAno(offset);

        selectMes.value = mes;
        selectAno.value = ano.toString();

        selectMes.dispatchEvent(new Event('change', { bubbles: true }));
        selectAno.dispatchEvent(new Event('change', { bubbles: true }));

        console.log(`[SESC botões] Navegando para: ${mes} ${ano}`);
    }

    function criarBotoesContainer() {
        const botoesContainer = document.createElement('div');
        botoesContainer.id = 'botoes-meses-container';
        botoesContainer.style.display = 'inline-block';
        botoesContainer.style.marginLeft = '5px';
        botoesContainer.style.verticalAlign = 'middle';

        for (let i = 0; i <= 4; i++) {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = i === 0 ? 'btn btn-mes-rapido atual' : 'btn btn-mes-rapido';
            botao.style.padding = '4px 8px';
            botao.style.fontSize = '12px';
            botao.dataset.mesOffset = i;
            botao.textContent = getNomeMesSistema(i);

            botao.addEventListener('click', function() {
                navegarParaMesSistema(parseInt(this.dataset.mesOffset, 10));
            });

            botoesContainer.appendChild(botao);
        }

        return botoesContainer;
    }

    // Tenta inserir os botões. Retorna true se inseriu (ou já estava presente e válido).
    function tentarInserirBotoes() {
        const container = document.querySelector('#select-month-container');
        if (!container) {
            return false;
        }

        const existente = document.querySelector('#botoes-meses-container');

        // Já está inserido e ainda conectado ao DOM atual: nada a fazer.
        if (existente && existente.isConnected) {
            return true;
        }

        // Existe um container "fantasma" (desconectado, ex: header recriado pelo
        // Angular): remove a referência velha antes de inserir a nova.
        if (existente && !existente.isConnected) {
            existente.remove();
        }

        const botoesContainer = criarBotoesContainer();
        container.parentNode.insertBefore(botoesContainer, container.nextSibling);
        console.log('[SESC botões] Botões dos meses adicionados com sucesso!');
        return true;
    }

    // --- Estratégia principal: MutationObserver ---
    // Em vez de confiar em 'load' + setTimeout (que falha se o Angular
    // monta/desmonta o cabeçalho do calendário depois do carregamento da
    // página, ou se o script corre antes do container existir), observamos
    // mudanças no DOM e tentamos inserir os botões sempre que for relevante.
    // Isso também recupera os botões automaticamente se o container for
    // recriado (ex: ao trocar de view/mês via Angular).
    const observer = new MutationObserver(() => {
        tentarInserirBotoes();
    });

    function iniciarObserver() {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Tenta uma vez de imediato, caso o container já exista.
        tentarInserirBotoes();
    }

    if (document.body) {
        iniciarObserver();
    } else {
        // Body ainda não existe (script rodando muito cedo, ex: @run-at document-start)
        document.addEventListener('DOMContentLoaded', iniciarObserver);
    }
})();
