// ==UserScript==
// @name         SIPLAN - Pintar Feriados (Mês + Semana)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Pinta as células do calendário MÊS e SEMANA no SIPLAN
// @author       Você
// @match        http://webapps.sorocaba.sescsp.org.br/siplan/*
// @match        https://webapps.sorocaba.sescsp.org.br/siplan/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      raw.githubusercontent.com
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const JSON_URL = 'https://raw.githubusercontent.com/melnic/siplus/refs/heads/master/feriados.json';

    const CORES = {
        'unidade-fechada': '#797979',      // cinza
        'feriado-unidade-aberta': '#64e1b9' // azul/verde claro
    };

    let datasEspeciais = {};
    let timeoutRepaint = null;

    // ============================================
    // BUSCAR FERIADOS
    // ============================================
    function buscarFeriados() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: JSON_URL,
                onload: function(response) {
                    if (response.status === 200) {
                        try {
                            const dados = JSON.parse(response.responseText);
                            if (dados && dados.datas) {
                                for (let item of dados.datas) {
                                    datasEspeciais[item.data] = {
                                        tipo: item.tipo,
                                        descricao: item.descricao || (item.tipo === 'unidade-fechada' ? '🔒 Unidade Fechada' : '📅 Feriado')
                                    };
                                }
                                console.log(`[Feriados] ✅ ${Object.keys(datasEspeciais).length} datas carregadas`);
                                resolve(true);
                            } else {
                                reject(new Error('JSON inválido'));
                            }
                        } catch(e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error(`HTTP ${response.status}`));
                    }
                },
                onerror: reject
            });
        });
    }

    // ============================================
    // PINTAR CÉLULAS (funciona para MÊS e SEMANA)
    // ============================================
    function pintarCelulas() {
        if (Object.keys(datasEspeciais).length === 0) return;

        // Busca TODAS as células com data-date (funciona para mês e semana)
        const todasCelulas = document.querySelectorAll('td[data-date]');

        if (todasCelulas.length === 0) {
            console.log('[Feriados] Nenhuma célula com data-date encontrada');
            return;
        }

        let celulasPintadas = 0;
        const isMonthView = document.querySelector('.fc-view-month')?.offsetParent !== null;

        for (let cell of todasCelulas) {
            const dataStr = cell.getAttribute('data-date');

            if (dataStr && datasEspeciais[dataStr]) {
                const info = datasEspeciais[dataStr];
                const cor = CORES[info.tipo];

                if (cor) {
                    // Pinta a célula td
                    cell.style.setProperty('background-color', cor, 'important');
                    cell.style.transition = 'background-color 0.2s ease';

                    // Adiciona tooltip
                    cell.setAttribute('title', info.descricao);
                    cell.classList.add('data-feriado');

                    // Adiciona indicador 🔒 apenas na visualização de mês
                    if (isMonthView && info.tipo === 'unidade-fechada') {
                        const dayNumber = cell.querySelector('.fc-day-number');
                        if (dayNumber && !dayNumber.querySelector('.lock-icon')) {
                            const lock = document.createElement('span');
                            lock.textContent = ' 🔒';
                            lock.className = 'lock-icon';
                            lock.style.fontSize = '10px';
                            lock.style.opacity = '0.7';
                            dayNumber.appendChild(lock);
                        }
                    }

                    celulasPintadas++;
                }
            }
        }

        if (celulasPintadas > 0) {
            console.log(`[Feriados] 🎨 ${celulasPintadas} células pintadas`);
        }
    }

    // ============================================
    // LIMPAR PINTURA
    // ============================================
    function limparPintura() {
        const cells = document.querySelectorAll('.data-feriado');
        for (let cell of cells) {
            cell.style.removeProperty('background-color');
            cell.classList.remove('data-feriado');
            cell.removeAttribute('title');
            const lock = cell.querySelector('.lock-icon');
            if (lock) lock.remove();
        }
    }

    // ============================================
    // REPAINT
    // ============================================
    function forcarRepaint() {
        if (timeoutRepaint) clearTimeout(timeoutRepaint);
        timeoutRepaint = setTimeout(() => {
            limparPintura();
            pintarCelulas();
        }, 150);
    }

    // ============================================
    // OBSERVAR MUDANÇAS
    // ============================================
    function observarMudancas() {
        // Botões de visualização
        ['btn-dia-view', 'btn-semana-view', 'btn-mes-view'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', () => setTimeout(forcarRepaint, 200));
        });

        // Navegação
        ['btn-prev', 'btn-next'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', forcarRepaint);
        });

        // Selects
        ['select-month', 'select-year'].forEach(id => {
            const select = document.getElementById(id);
            if (select) select.addEventListener('change', forcarRepaint);
        });

        // Botões de meses rápidos
        document.querySelectorAll('.btn-mes-rapido').forEach(btn => {
            btn.addEventListener('click', forcarRepaint);
        });

        // MutationObserver
        const target = document.getElementById('full-calendar-content');
        if (target) {
            const observer = new MutationObserver(() => forcarRepaint());
            observer.observe(target, { childList: true, subtree: true });
            console.log('[Feriados] 👁️ Observer ativo');
        }
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function aguardarInicializacao() {
        return new Promise((resolve) => {
            let tentativas = 0;
            const interval = setInterval(() => {
                const hasCells = document.querySelector('td[data-date]');
                if (hasCells || tentativas > 30) {
                    clearInterval(interval);
                    resolve();
                }
                tentativas++;
            }, 500);
        });
    }

    // ============================================
    // ESTILOS
    // ============================================
    GM_addStyle(`
        .data-feriado {
            transition: background-color 0.2s ease;
        }
        .data-feriado:hover {
            filter: brightness(0.95);
            cursor: help;
        }
        .lock-icon {
            display: inline-block;
            margin-left: 2px;
        }
    `);

    // ============================================
    // INÍCIO
    // ============================================
    console.log('[Feriados] 🚀 Iniciando...');
    console.log(`[Feriados] 📋 JSON URL: ${JSON_URL}`);

    buscarFeriados()
        .then(async () => {
            await aguardarInicializacao();
            observarMudancas();
            setTimeout(pintarCelulas, 500);
        })
        .catch(err => {
            console.error('[Feriados] ❌ Erro:', err.message);
            console.log('[Feriados] ⚠️ Exemplo do JSON esperado:');
            console.log(JSON.stringify({
                "datas": [
                    { "data": "2026-09-07", "tipo": "feriado-unidade-aberta", "descricao": "Independência do Brasil" },
                    { "data": "2026-09-08", "tipo": "unidade-fechada", "descricao": "Ponto Facultativo" }
                ]
            }, null, 2));
        });
})();
