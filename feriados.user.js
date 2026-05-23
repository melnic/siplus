// ==UserScript==
// @name         SIPLAN - Pintar Feriados no Calendário
// @namespace    http://tampermonkey.net/
// @version      1.3.1
// @description  Pinta as células do calendário SIPLAN com base nos feriados
// @match        http://webapps.sorocaba.sescsp.org.br/siplan/*
// @match        https://webapps.sorocaba.sescsp.org.br/siplan/*
// @downloadURL https://github.com/melnic/siplus/raw/refs/heads/master/feriados.user.js
// @updateURL   https://github.com/melnic/siplus/raw/refs/heads/master/feriados.user.js
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Feriados embutidos diretamente no script (evita problemas de rede)
    const FERIADOS = [
        { "data": "2026-09-07", "tipo": "aberta", "descricao": "Independência do Brasil \n UO Aberta" },
        { "data": "2026-09-08", "tipo": "fechada", "descricao": "Independência do Brasil \n UO Fechada" },
        { "data": "2026-10-12", "tipo": "aberta", "descricao": "Nossa Senhora Aparecida \n UO Aberta" },
        { "data": "2026-10-13", "tipo": "fechada", "descricao": "Nossa Senhora Aparecida \n UO Fechada" },
        { "data": "2026-11-02", "tipo": "aberta", "descricao": "Finados \n UO Aberta" },
        { "data": "2026-11-03", "tipo": "fechada", "descricao": "Finados \n UO Fechada" },
        { "data": "2026-11-20", "tipo": "aberta", "descricao": "Consciência Negra \n UO Aberta" },        
        
        { "data": "2027-02-08", "tipo": "aberta", "descricao": "Carnaval \n UO Aberta" },
        { "data": "2027-02-09", "tipo": "aberta", "descricao": "Carnaval \n UO Aberta" },
        { "data": "2027-02-10", "tipo": "fechada", "descricao": "Cinzas \n UO Fechada" },
        { "data": "2027-04-21", "tipo": "aberta", "descricao": "Tiradentes \n UO Aberta" },
        { "data": "2027-05-27", "tipo": "aberta", "descricao": "Corpus Christi \n UO Aberta" },
        { "data": "2027-07-09", "tipo": "aberta", "descricao": "Revolução Constitucionalista \n UO Aberta" },
        { "data": "2027-09-07", "tipo": "aberta", "descricao": "Independência \n UO Aberta" },
        { "data": "2027-10-12", "tipo": "aberta", "descricao": "Nossa Senhora \n UO Aberta" },        
        { "data": "2027-11-02", "tipo": "aberta", "descricao": "Finados \n UO Aberta" },
        { "data": "2027-11-15", "tipo": "aberta", "descricao": "República \n UO Aberta" },
        { "data": "2027-11-16", "tipo": "fechada", "descricao": "República \n UO Aberta" }
    ];

    const CORES = {
        'fechada': {
            backgroundColor: '#555555',      // Cinza claro
            borderColor: '#757575',          // Cinza médio
            titleColor: '#424242'            // Cinza escuro
        },
        'aberta': {
            backgroundColor: '#e0f7fa',      // Azul água bem claro
            borderColor: '#00acc1',          // Azul ciano
            titleColor: '#006064'            // Azul petróleo escuro
        }
    };

    // Função para obter feriado de uma data específica
    function obterFeriado(data) {
        return FERIADOS.find(f => f.data === data);
    }

    // Função para pintar uma célula
    function pintarCelula(cell, feriado) {
        if (!feriado) return;

        const cor = CORES[feriado.tipo];
        if (!cor) return;

        // Aplicar estilos
        cell.style.backgroundColor = cor.backgroundColor;
        cell.style.border = `1px solid ${cor.borderColor}`;

        // Pintar o número do dia
        const dayNumber = cell.querySelector('.fc-day-number');
        if (dayNumber) {
            dayNumber.style.color = cor.titleColor;
            dayNumber.style.fontWeight = 'bold';
        }

        // Adicionar tooltip com a descrição do feriado
        cell.setAttribute('title', feriado.descricao);
        cell.setAttribute('data-feriado', feriado.tipo);
        cell.setAttribute('data-feriado-desc', feriado.descricao);

        // Adicionar classe para identificação
        cell.classList.add('feriado-pintado');
        cell.classList.add(`feriado-${feriado.tipo}`);

        // Se for feriado fechada, adicionar ícone de cadeado
        if (feriado.tipo === 'fechada') {
            if (dayNumber && !dayNumber.querySelector('.lock')) {
                const lockIcon = document.createElement('span');
                lockIcon.className = 'lock';
                lockIcon.textContent = ' 🔒';
                lockIcon.style.fontSize = '11px';
                lockIcon.style.marginLeft = '4px';
                lockIcon.title = 'Unidade fechada';
                dayNumber.appendChild(lockIcon);
            }
        }
    }

    // Função principal para processar todas as células
    function processarCelulas() {
        const cells = document.querySelectorAll('td[data-date]');
        let count = 0;

        cells.forEach(cell => {
            const data = cell.getAttribute('data-date');
            const feriado = obterFeriado(data);
            if (feriado) {
                pintarCelula(cell, feriado);
                count++;
            }
        });

        if (count > 0) {
            console.log(`[SIPLAN Feriados] ${count} células pintadas com feriados`);
        }
    }

    // Função para adicionar estilos CSS
    function adicionarEstilos() {
        const style = document.createElement('style');
        style.textContent = `
            .feriado-pintado {
                transition: background-color 0.2s;
            }
            .feriado-pintado:hover {
                filter: brightness(0.95);
                cursor: help;
            }
            .feriado-fechada {
                background-color: ${CORES.fechada.backgroundColor} !important;
            }
            .feriado-aberta {
                background-color: ${CORES.aberta.backgroundColor} !important;
            }
            .lock {
                display: inline-block;
            }
        `;
        document.head.appendChild(style);
    }

    // MutationObserver para detectar mudanças no DOM
    function observarMudancas() {
        const observer = new MutationObserver((mutations) => {
            let deveProcessar = false;

            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if ((node.matches && node.matches('td[data-date]')) ||
                                (node.querySelector && node.querySelector('td[data-date]'))) {
                                deveProcessar = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (deveProcessar) {
                setTimeout(processarCelulas, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    // Inicialização
    function init() {
        adicionarEstilos();
        processarCelulas();
        observarMudancas();

        // Eventos para quando o calendário mudar de mês
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        const selectMes = document.getElementById('select-month');
        const selectAno = document.getElementById('select-year');

        if (btnPrev) btnPrev.addEventListener('click', () => setTimeout(processarCelulas, 300));
        if (btnNext) btnNext.addEventListener('click', () => setTimeout(processarCelulas, 300));
        if (selectMes) selectMes.addEventListener('change', () => setTimeout(processarCelulas, 300));
        if (selectAno) selectAno.addEventListener('change', () => setTimeout(processarCelulas, 300));

        console.log('[SIPLAN Feriados] User script inicializado com sucesso!');
    }

    // Aguardar o DOM estar completamente carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
