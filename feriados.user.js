// ==UserScript==
// @name         SIPLAN - Pintar Feriados no Calendário
// @namespace    http://tampermonkey.net/
// @version      1.4.1
// @description  Pinta as células do calendário SIPLAN com base nos feriados
// @match        http://webapps.sorocaba.sescsp.org.br/siplan/*
// @match        https://webapps.sorocaba.sescsp.org.br/siplan/*
// @downloadURL https://github.com/melnic/siplus/raw/refs/heads/master/feriados.user.js
// @updateURL   https://github.com/melnic/siplus/raw/refs/heads/master/feriados.user.js
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Feriados no formato brasileiro (DD/MM/AAAA)
    const FERIADOS = [
        { "data": "04/06/2026", "tipo": "aberta", "descricao": "Corpus Christi" },
        { "data": "09/07/2026", "tipo": "aberta", "descricao": "Revolução Constitucionalista" },
        { "data": "15/08/2026", "tipo": "aberta", "descricao": "Aniversário de Sorocaba" },

        { "data": "07/09/2026", "tipo": "aberta", "descricao": "Independência do Brasil" },
        { "data": "08/09/2026", "tipo": "fechada", "descricao": "Independência do Brasil" },
        { "data": "12/10/2026", "tipo": "aberta", "descricao": "Nossa Senhora Aparecida" },
        { "data": "13/10/2026", "tipo": "fechada", "descricao": "Nossa Senhora Aparecida" },
        { "data": "02/11/2026", "tipo": "aberta", "descricao": "Finados" },
        { "data": "03/11/2026", "tipo": "fechada", "descricao": "Finados" },
        { "data": "20/11/2026", "tipo": "aberta", "descricao": "Consciência Negra" },

        { "data": "08/02/2027", "tipo": "aberta", "descricao": "Carnaval" },
        { "data": "09/02/2027", "tipo": "aberta", "descricao": "Carnaval" },
        { "data": "10/02/2027", "tipo": "fechada", "descricao": "Cinzas" },
        { "data": "21/04/2027", "tipo": "aberta", "descricao": "Tiradentes" },
        { "data": "27/05/2027", "tipo": "aberta", "descricao": "Corpus Christi" },
        { "data": "09/07/2027", "tipo": "aberta", "descricao": "Revolução Constitucionalista" },
        { "data": "07/09/2027", "tipo": "aberta", "descricao": "Independência" },
        { "data": "12/10/2027", "tipo": "aberta", "descricao": "Nossa Senhora" },
        { "data": "02/11/2027", "tipo": "aberta", "descricao": "Finados" },
        { "data": "15/11/2027", "tipo": "aberta", "descricao": "República" },
        { "data": "16/11/2027", "tipo": "fechada", "descricao": "República" }
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

    // Função para converter data do formato brasileiro (DD/MM/AAAA) para ISO (AAAA-MM-DD)
    function converterDataParaISO(dataBR) {
        if (!dataBR) return null;

        // Verifica se já está no formato ISO
        if (dataBR.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dataBR;
        }

        // Converte de DD/MM/AAAA para AAAA-MM-DD
        const partes = dataBR.split('/');
        if (partes.length === 3) {
            const dia = partes[0].padStart(2, '0');
            const mes = partes[1].padStart(2, '0');
            const ano = partes[2];
            return `${ano}-${mes}-${dia}`;
        }

        return dataBR;
    }

    // Função para converter data do formato ISO para brasileiro (para debug)
    function converterDataParaBR(dataISO) {
        if (!dataISO) return null;
        const partes = dataISO.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return dataISO;
    }

    // Pré-converte as datas dos feriados para ISO (mantém o original para referência)
    const FERIADOS_ISO = FERIADOS.map(feriado => ({
        ...feriado,
        dataISO: converterDataParaISO(feriado.data),
        dataOriginal: feriado.data  // Mantém o formato original para debug
    }));

    // Função para obter feriado de uma data específica (agora a data do calendário está em ISO)
    function obterFeriado(dataISO) {
        const feriado = FERIADOS_ISO.find(f => f.dataISO === dataISO);
        return feriado;
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

        let legenda = '';

        // Adicionar tooltip com a descrição do feriado
        if (feriado.tipo === 'fechada') {
            legenda = feriado.descricao + ' \n UO Fechada';
            }else{
            legenda = feriado.descricao + ' \n UO Aberta';
        }
        cell.setAttribute('title', legenda);
        cell.setAttribute('data-feriado', feriado.tipo);
        cell.setAttribute('data-feriado-desc', legenda);


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
            const dataISO = cell.getAttribute('data-date');
            const feriado = obterFeriado(dataISO);
            if (feriado) {
                pintarCelula(cell, feriado);
                count++;
            }
        });

        if (count > 0) {
            console.log(`[SIPLAN Feriados] ${count} células pintadas com feriados`);

            // Debug: Mostrar os feriados do mês atual (opcional)
            if (count > 0 && cells.length > 0) {
                const primeiroDia = cells[0].getAttribute('data-date');
                if (primeiroDia) {
                    const mesAno = primeiroDia.substring(0, 7);
                    const feriadosMes = FERIADOS_ISO.filter(f => f.dataISO.startsWith(mesAno));
                    if (feriadosMes.length > 0) {
                        console.log(`[SIPLAN Feriados] Feriados em ${mesAno}:`,
                            feriadosMes.map(f => `${converterDataParaBR(f.dataISO)} (${f.tipo})`).join(', '));
                    }
                }
            }
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
        console.log('[SIPLAN Feriados] Usando formato de data brasileiro (DD/MM/AAAA)');
    }

    // Aguardar o DOM estar completamente carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
