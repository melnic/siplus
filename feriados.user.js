// ==UserScript==
// @name         SIPLAN - Pintar Feriados no Calendário
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Pinta as células do calendário SIPLAN com base nos feriados carregados do JSON
// @author       SeuNome
// @match        http://webapps.sorocaba.sescsp.org.br/siplan/*
// @match        https://webapps.sorocaba.sescsp.org.br/siplan/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Configurações
    const FERIADOS_URL = 'https://raw.githubusercontent.com/melnic/siplus/refs/heads/master/feriados.json';
    const CORES = {
        'fechada': {
            backgroundColor: '#4b4b4b',
            borderColor: '#770000',
            titleColor: '#570000'
        },
        'aberta': {
            backgroundColor: '#5ce4dd',
            borderColor: '#2503a0',
            titleColor: '#0047cc'
        }
    };

    // Cache dos feriados
    let feriadosCache = null;
    let isLoading = false;

    // Função para carregar feriados
    function carregarFeriados() {
        return new Promise((resolve, reject) => {
            if (feriadosCache) {
                resolve(feriadosCache);
                return;
            }

            if (isLoading) {
                const interval = setInterval(() => {
                    if (feriadosCache) {
                        clearInterval(interval);
                        resolve(feriadosCache);
                    }
                }, 100);
                return;
            }

            isLoading = true;

            GM_xmlhttpRequest({
                method: 'GET',
                url: FERIADOS_URL,
                onload: function(response) {
                    isLoading = false;
                    if (response.status === 200) {
                        try {
                            const data = JSON.parse(response.responseText);
                            feriadosCache = data.datas || [];
                            console.log(`[SIPLAN Feriados] Carregados ${feriadosCache.length} feriados`);
                            resolve(feriadosCache);
                        } catch (e) {
                            console.error('[SIPLAN Feriados] Erro ao parsear JSON:', e);
                            reject(e);
                        }
                    } else {
                        console.error('[SIPLAN Feriados] Erro ao carregar:', response.status);
                        reject(new Error(`HTTP ${response.status}`));
                    }
                },
                onerror: function(error) {
                    isLoading = false;
                    console.error('[SIPLAN Feriados] Erro na requisição:', error);
                    reject(error);
                }
            });
        });
    }

    // Função para obter feriado de uma data específica
    function obterFeriado(data) {
        if (!feriadosCache) return null;
        return feriadosCache.find(f => f.data === data);
    }

    // Função para pintar uma célula
    function pintarCelula(cell, feriado) {
        if (!feriado) return;

        const cor = CORES[feriado.tipo];
        if (!cor) return;

        // Salvar estilo original para poder restaurar depois (se necessário)
        if (!cell.hasAttribute('data-original-bg')) {
            cell.setAttribute('data-original-bg', cell.style.backgroundColor || '');
        }

        // Aplicar estilos
        cell.style.backgroundColor = cor.backgroundColor;
        cell.style.borderColor = cor.borderColor;
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

        // Se for feriado fechado, adicionar ícone de cadeado
        if (feriado.tipo === 'fechada') {
            adicionarIconeCadeado(cell);
        }
    }

    // Função para adicionar ícone de cadeado
    function adicionarIconeCadeado(cell) {
        const dayNumber = cell.querySelector('.fc-day-number');
        if (dayNumber && !dayNumber.querySelector('.lock')) {
            const lockIcon = document.createElement('span');
            lockIcon.className = 'lock';
            lockIcon.textContent = ' 🔒';
            lockIcon.style.fontSize = '12px';
            lockIcon.title = 'Unidade fechada';
            dayNumber.appendChild(lockIcon);
        }
    }

    // Função principal para processar todas as células
    async function processarCelulas() {
        try {
            await carregarFeriados();

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
        } catch (error) {
            console.error('[SIPLAN Feriados] Erro ao processar células:', error);
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
                background-color: #ffcccc !important;
            }
            .feriado-aberta {
                background-color: #ffffcc !important;
            }
            .lock {
                display: inline-block;
                margin-left: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    // MutationObserver para detectar mudanças no DOM
    function observarMudancas() {
        const observer = new MutationObserver((mutations) => {
            // Verificar se alguma célula foi adicionada ou removida
            let deveProcessar = false;

            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    // Verificar se há células adicionadas
                    const cellsAdicionadas = mutation.addedNodes.length > 0;
                    if (cellsAdicionadas) {
                        // Verificar se as células adicionadas são células do calendário
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.matches && (node.matches('td[data-date]') || node.querySelector('td[data-date]'))) {
                                    deveProcessar = true;
                                    break;
                                }
                            }
                        }
                    }
                } else if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Se o estilo de uma célula foi modificado, podemos precisar reaplicar
                    const target = mutation.target;
                    if (target.matches && target.matches('td[data-date]')) {
                        const data = target.getAttribute('data-date');
                        const feriado = obterFeriado(data);
                        if (feriado && !target.classList.contains('feriado-pintado')) {
                            pintarCelula(target, feriado);
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
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        return observer;
    }

    // Inicialização
    function init() {
        adicionarEstilos();
        processarCelulas();
        observarMudancas();

        // Adicionar evento para quando o calendário mudar de mês
        document.addEventListener('click', (e) => {
            const btnPrev = document.getElementById('btn-prev');
            const btnNext = document.getElementById('btn-next');

            if (e.target === btnPrev || e.target === btnNext ||
                e.target.parentElement === btnPrev || e.target.parentElement === btnNext) {
                setTimeout(processarCelulas, 300);
            }
        });

        // Observar mudanças nos selects de mês/ano
        const selectMes = document.getElementById('select-month');
        const selectAno = document.getElementById('select-year');

        if (selectMes) {
            selectMes.addEventListener('change', () => setTimeout(processarCelulas, 300));
        }
        if (selectAno) {
            selectAno.addEventListener('change', () => setTimeout(processarCelulas, 300));
        }

        console.log('[SIPLAN Feriados] User script inicializado');
    }

    // Aguardar o DOM estar completamente carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
