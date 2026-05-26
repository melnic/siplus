// ==UserScript==
// @name         SESC Sorocaba - Botões Meses Atual e Futuros
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Adiciona botões para o mês atual e próximos 4 meses no calendário do SESC Sorocaba
// @author       Você
// @match        http://webapps.sorocaba.sescsp.org.br/siplan/*
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

    // Aguarda o carregamento da página
    window.addEventListener('load', function() {
        setTimeout(adicionarBotoesMeses, 1000);
    });

    function adicionarBotoesMeses() {
        const container = document.querySelector('#select-month-container');
        if (!container) {
            console.log('Container do mês não encontrado, tentando novamente...');
            setTimeout(adicionarBotoesMeses, 500);
            return;
        }

        // Verifica se os botões já foram adicionados
        if (document.querySelector('#botoes-meses-container')) {
            return;
        }

        // Cria o container para os botões
        const botoesContainer = document.createElement('div');
        botoesContainer.id = 'botoes-meses-container';
        botoesContainer.style.display = 'inline-block';
        botoesContainer.style.marginLeft = '5px';
        botoesContainer.style.verticalAlign = 'middle';

        // Adiciona os botões: mês atual do sistema + 4 meses futuros
        for (let i = 0; i <= 4; i++) {
            const botao = document.createElement('button');
            botao.className = i === 0 ? 'btn btn-mes-rapido atual' : 'btn btn-mes-rapido';
            botao.style.marginLeft = '0px';
            botao.style.marginRight = '0px';
            botao.style.padding = '4px 8px';
            botao.style.fontSize = '12px';
            botao.dataset.mesOffset = i;
            botao.textContent = getNomeMesSistema(i);

            botao.addEventListener('click', function() {
                navegarParaMesSistema(parseInt(this.dataset.mesOffset));
            });

            botoesContainer.appendChild(botao);
        }

        // Insere os botões após o container do mês/ano
        container.parentNode.insertBefore(botoesContainer, container.nextSibling);

        console.log('Botões dos meses adicionados com sucesso!');
    }

    function getNomeMesSistema(offset) {
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        // Obtém a data atual do sistema
        const dataAtual = new Date();
        let mesAtual = dataAtual.getMonth(); // 0-11
        let anoAtual = dataAtual.getFullYear();

        // Calcula o mês baseado no offset
        let novoMes = mesAtual + offset;
        let novoAno = anoAtual;

        // Ajusta ano se necessário
        if (novoMes >= 12) {
            novoMes = novoMes % 12;
            novoAno += Math.floor((mesAtual + offset) / 12);
        }

        // Retorna as 3 primeiras letras do mês
        return meses[novoMes].substring(0, 3);
    }

    function navegarParaMesSistema(offset) {
        const selectMes = document.querySelector('#select-month');
        const selectAno = document.querySelector('#select-year');

        if (!selectMes || !selectAno) {
            console.error('Elementos de seleção não encontrados');
            return;
        }

        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        // Obtém a data atual do sistema
        const dataAtual = new Date();
        let mesAtual = dataAtual.getMonth(); // 0-11
        let anoAtual = dataAtual.getFullYear();

        // Calcula o mês baseado no offset
        let novoMes = mesAtual + offset;
        let novoAno = anoAtual;

        // Ajusta ano se necessário
        if (novoMes >= 12) {
            novoMes = novoMes % 12;
            novoAno += Math.floor((mesAtual + offset) / 12);
        }

        // Define os novos valores nos selects
        selectMes.value = meses[novoMes];
        selectAno.value = novoAno.toString();

        // Dispara o evento de change para atualizar o calendário
        const eventMes = new Event('change', { bubbles: true });
        const eventAno = new Event('change', { bubbles: true });

        selectMes.dispatchEvent(eventMes);
        selectAno.dispatchEvent(eventAno);

        console.log(`Navegando para: ${meses[novoMes]} ${novoAno}`);
    }

    // Remove as funções de observação que não são mais necessárias
    // pois os botões agora são baseados apenas na data do sistema
})();
