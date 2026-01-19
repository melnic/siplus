// ==UserScript==
// @name         Pesquisa Centro de Custo - Paradigma (Busca Multi-campo)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Adiciona campo de busca para centro de custo no sistema Paradigma - Busca por descrição e número
// @author       Você
// @match        http*://*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Estilos CSS para o campo de busca
    GM_addStyle(`
        #centroCustoSearchContainer {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            background: white;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            min-width: 350px;
            max-width: 450px;
        }

        #centroCustoSearch {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }

        #centroCustoResult {
            margin-top: 10px;
            padding: 10px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            display: none;
            max-height: 400px;
            overflow-y: auto;
            box-sizing: border-box;
        }

        .result-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .result-item:hover {
            background-color: #e9ecef;
        }

        .result-item:last-child {
            border-bottom: none;
        }

        .codigo-ep {
            font-weight: bold;
            color: #007bff;
            background-color: #e7f3ff;
            padding: 3px 6px;
            border-radius: 3px;
            display: inline-block;
            margin-bottom: 5px;
            font-size: 13px;
        }

        .sgo-info {
            margin-bottom: 4px;
        }

        .sgo-numero {
            color: #28a745;
            font-weight: 600;
            font-size: 13px;
        }

        .sgo-descricao {
            color: #495057;
            font-size: 13px;
            line-height: 1.4;
            margin-top: 3px;
        }

        .go-info {
            font-size: 12px;
            color: #6c757d;
            margin-top: 5px;
            border-top: 1px dashed #dee2e6;
            padding-top: 5px;
        }

        .go-numero {
            font-weight: 500;
            color: #dc3545;
        }

        .loading {
            color: #6c757d;
            font-style: italic;
            text-align: center;
            padding: 10px;
        }

        .no-results {
            color: #dc3545;
            font-style: italic;
            text-align: center;
            padding: 10px;
        }

        .search-info {
            font-size: 11px;
            color: #6c757d;
            text-align: right;
            margin-top: 5px;
        }

        .highlight {
            background-color: #fff3cd;
            padding: 0 2px;
            border-radius: 2px;
            font-weight: 600;
        }

        .search-options {
            display: flex;
            gap: 10px;
            margin-top: 8px;
            font-size: 12px;
        }

        .search-option {
            display: flex;
            align-items: center;
            cursor: pointer;
        }

        .search-option input {
            margin-right: 4px;
        }

        .search-option label {
            cursor: pointer;
            user-select: none;
        }

        .match-type {
            font-size: 10px;
            color: #6c757d;
            margin-left: 5px;
            font-style: italic;
        }

        .exact-match {
            color: #28a745;
            font-weight: bold;
        }

        .partial-match {
            color: #fd7e14;
        }
    `);

    // URL do JSON (substitua pela URL real do seu JSON)
    const JSON_URL = 'https://seuservidor.com/caminho/para/seu-json.json';


   const JSON_FIX = [
       {"uoCodigo":96,"sgoCodigo":145195,"sgoNumero":2632001,"sgoDescricao":"VIAGENS","sgoProjetoDescricao":null,"goNumero":2632,"goDescricao":"VIAGENS","goProjetoDescricao":null,"projetoCodigo":1,"projetoDescricao":"SESC-SP","codigoEp":"01.04.23.03","programaNumero":4,"atividadeNumero":23,"modalidadeNumero":null,"realizacaoNumero":null,"programaCodigo":28,"atividadeCodigo":153,"modalidadeCodigo":null,"realizacaoCodigo":null,"programaDescricao":"Lazer","atividadeDescricao":"Turismo Social","modalidadeDescricao":null,"realizacaoDescricao":null,"uoSigla":"SOROCABA","secaoCodigo":1,"secaoNumero":"01","secaoDescricao":"Programas Sociais","subatividadeCodigo":749,"subatividadeNumero":"03","subatividadeDescricao":"Viagens"}
   ];
    // Variável para armazenar os dados do JSON
    let dadosJSON = [];

    dadosJSON = JSON_FIX;

    // Flag para controle de carregamento
    let dadosCarregados = true;//false;

    // Configuração de busca
    let buscaConfig = {
        buscarPorDescricao: true,
        buscarPorNumero: true,
        buscaExataNumero: false
    };

    // Função para carregar os dados JSON
    function carregarDados() {
        return new Promise((resolve, reject) => {
            // Se já carregou, retorna os dados
            if (dadosCarregados) {
                resolve(dadosJSON);
                return;
            }

            // Tenta buscar o JSON via requisição HTTP
            GM_xmlhttpRequest({
                method: 'GET',
                url: JSON_URL,
                onload: function(response) {
                    try {
                        dadosJSON = JSON.parse(response.responseText);
                        dadosCarregados = true;
                        console.log('Dados carregados com sucesso:', dadosJSON.length, 'itens');
                        resolve(dadosJSON);
                    } catch (e) {
                        console.error('Erro ao parsear JSON:', e);
                        reject(e);
                    }
                },
                onerror: function(error) {
                    console.error('Erro ao carregar JSON:', error);
                    reject(error);
                }
            });
        });
    }

    // Função para destacar o termo buscado no texto
    function highlightText(text, query) {
        if (!text || !query) return text;

        try {
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<span class="highlight">$1</span>');
        } catch (e) {
            return text;
        }
    }

    // Função para buscar no JSON por sgoDescricao e goNumero
    function buscarCentroCusto(query) {
        if (!dadosCarregados || dadosJSON.length === 0) {
            return [];
        }

        const queryTerm = query.toString().trim();
        if (!queryTerm) return [];

        const queryLower = queryTerm.toLowerCase();
        const isNumericQuery = /^\d+$/.test(queryTerm);

        let resultados = [];

        // Busca nos campos configurados
        dadosJSON.forEach(item => {
            let matchFound = false;
            let matchType = '';
            let matchField = '';

            // Busca por descrição
            if (buscaConfig.buscarPorDescricao && item.sgoDescricao) {
                const descricaoLower = item.sgoDescricao.toLowerCase();
                if (descricaoLower.includes(queryLower)) {
                    matchFound = true;
                    matchType = 'descrição';
                    matchField = 'sgoDescricao';
                }
            }

            // Busca por número
            if (buscaConfig.buscarPorNumero && item.goNumero) {
                const goNumeroStr = item.goNumero.toString();

                if (buscaConfig.buscaExataNumero && isNumericQuery) {
                    // Busca exata
                    if (goNumeroStr === queryTerm) {
                        matchFound = true;
                        matchType = 'número (exato)';
                        matchField = 'goNumero';
                    }
                } else {
                    // Busca parcial
                    if (goNumeroStr.includes(queryTerm)) {
                        matchFound = true;
                        matchType = 'número';
                        matchField = 'goNumero';
                    }
                }
            }

            if (matchFound) {
                resultados.push({
                    ...item,
                    matchType: matchType,
                    matchField: matchField,
                    isExactMatch: buscaConfig.buscaExataNumero && matchField === 'goNumero'
                });
            }
        });

        // Ordenar resultados: exatos primeiro, depois por relevância
        resultados.sort((a, b) => {
            // Primeiro: matches exatos primeiro
            if (a.isExactMatch && !b.isExactMatch) return -1;
            if (!a.isExactMatch && b.isExactMatch) return 1;

            // Segundo: número tem prioridade sobre descrição
            if (a.matchField === 'goNumero' && b.matchField === 'sgoDescricao') return -1;
            if (a.matchField === 'sgoDescricao' && b.matchField === 'goNumero') return 1;

            // Terceiro: ordenar por goNumero
            return a.goNumero - b.goNumero;
        });

        return resultados.slice(0, 20); // Limita a 20 resultados
    }

    // Função para criar a interface
    function criarInterface() {
        const container = document.createElement('div');
        container.id = 'centroCustoSearchContainer';

        const input = document.createElement('input');
        input.id = 'centroCustoSearch';
        input.type = 'text';
        input.placeholder = 'Buscar por descrição ou número...';

        // Opções de busca
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'search-options';

        // Opção: Buscar por descrição
        const descricaoOption = document.createElement('div');
        descricaoOption.className = 'search-option';
        descricaoOption.innerHTML = `
            <input type="checkbox" id="buscarDescricao" checked>
            <label for="buscarDescricao">Descrição</label>
        `;

        // Opção: Buscar por número
        const numeroOption = document.createElement('div');
        numeroOption.className = 'search-option';
        numeroOption.innerHTML = `
            <input type="checkbox" id="buscarNumero" checked>
            <label for="buscarNumero">Número</label>
        `;

        // Opção: Busca exata de número
        const exatoOption = document.createElement('div');
        exatoOption.className = 'search-option';
        exatoOption.innerHTML = `
            <input type="checkbox" id="buscaExataNumero">
            <label for="buscaExataNumero">Exato</label>
        `;

        optionsDiv.appendChild(descricaoOption);
        optionsDiv.appendChild(numeroOption);
        optionsDiv.appendChild(exatoOption);

        const searchInfo = document.createElement('div');
        searchInfo.className = 'search-info';
        searchInfo.textContent = 'Busca em: descrição e número';

        const resultDiv = document.createElement('div');
        resultDiv.id = 'centroCustoResult';

        container.appendChild(input);
        container.appendChild(optionsDiv);
        container.appendChild(searchInfo);
        container.appendChild(resultDiv);
        document.body.appendChild(container);

        // Configurar eventos das opções
        const buscarDescricaoCheck = descricaoOption.querySelector('input');
        const buscarNumeroCheck = numeroOption.querySelector('input');
        const buscaExataCheck = exatoOption.querySelector('input');

        buscarDescricaoCheck.addEventListener('change', function() {
            buscaConfig.buscarPorDescricao = this.checked;
            atualizarInfoBusca(searchInfo);
        });

        buscarNumeroCheck.addEventListener('change', function() {
            buscaConfig.buscarPorNumero = this.checked;
            exatoOption.style.display = this.checked ? 'flex' : 'none';
            atualizarInfoBusca(searchInfo);
        });

        buscaExataCheck.addEventListener('change', function() {
            buscaConfig.buscaExataNumero = this.checked;
            atualizarInfoBusca(searchInfo);
        });

        // Carregar dados quando a interface for criada
        carregarDados().catch(() => {
            console.warn('Não foi possível carregar dados do JSON');
        });

        // Adicionar eventos
        let timeoutBusca;
        input.addEventListener('input', function(e) {
            clearTimeout(timeoutBusca);

            const query = e.target.value.trim();
            resultDiv.innerHTML = '';
            resultDiv.style.display = 'none';

            if (query.length < 2) {
                if (query.length > 0) {
                    searchInfo.textContent = `Digite mais ${2 - query.length} caractere(s)`;
                } else {
                    atualizarInfoBusca(searchInfo);
                }
                return;
            }

            // Debounce para evitar muitas buscas
            timeoutBusca = setTimeout(() => {
                if (!dadosCarregados) {
                    resultDiv.innerHTML = '<div class="loading">Carregando dados...</div>';
                    resultDiv.style.display = 'block';

                    // Tenta carregar dados novamente se ainda não carregou
                    carregarDados().then(() => {
                        realizarBusca(query, resultDiv, searchInfo);
                    }).catch(() => {
                        resultDiv.innerHTML = '<div class="no-results">Erro ao carregar dados</div>';
                        resultDiv.style.display = 'block';
                    });
                } else {
                    realizarBusca(query, resultDiv, searchInfo);
                }
            }, 300);
        });

        // Limpar resultados ao perder foco após um tempo
        input.addEventListener('blur', function() {
            setTimeout(() => {
                resultDiv.style.display = 'none';
            }, 200);
        });

        input.addEventListener('focus', function() {
            if (resultDiv.innerHTML.trim() !== '') {
                resultDiv.style.display = 'block';
            }
        });

        // Permitir navegação com teclado
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                resultDiv.style.display = 'none';
                input.blur();
            }
        });

        // Função para atualizar informações da busca
        function atualizarInfoBusca(infoElement) {
            const opcoes = [];
            if (buscaConfig.buscarPorDescricao) opcoes.push('descrição');
            if (buscaConfig.buscarPorNumero) {
                if (buscaConfig.buscaExataNumero) {
                    opcoes.push('número (exato)');
                } else {
                    opcoes.push('número');
                }
            }

            if (opcoes.length === 0) {
                infoElement.textContent = 'Selecione ao menos uma opção de busca';
                infoElement.style.color = '#dc3545';
            } else {
                infoElement.textContent = `Busca em: ${opcoes.join(' e ')}`;
                infoElement.style.color = '';
            }
        }
    }

    function realizarBusca(query, resultDiv, searchInfo) {
        const resultados = buscarCentroCusto(query);

        if (resultados.length === 0) {
            resultDiv.innerHTML = '<div class="no-results">Nenhum resultado encontrado</div>';
            resultDiv.style.display = 'block';
            searchInfo.textContent += ` | 0 resultados para: "${query}"`;
            return;
        }

        let html = '';
        resultados.forEach(item => {
            const sgoDescricaoHighlighted = highlightText(item.sgoDescricao, query);
            const goDescricaoHighlighted = item.goDescricao ? highlightText(item.goDescricao, query) : '';

            // Determinar classe do tipo de match
            const matchClass = item.isExactMatch ? 'exact-match' : 'partial-match';

            html += `
                <div class="result-item" data-codigo-ep="${item.codigoEp}" data-sgo-numero="${item.sgoNumero}" data-go-numero="${item.goNumero}">
                    <div class="codigo-ep">Código EP: ${item.codigoEp || 'N/A'}</div>
                    <div class="sgo-info">
                        <div class="sgo-numero">Número SGO: ${item.sgoNumero || 'N/A'}</div>
                        <div class="sgo-descricao">${sgoDescricaoHighlighted}</div>
                    </div>
                    <div class="go-info">
                        <span class="go-numero">GO ${item.goNumero || 'N/A'}</span>: ${goDescricaoHighlighted}
                        <span class="match-type ${matchClass}">(por ${item.matchType})</span>
                    </div>
                </div>
            `;
        });

        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
        searchInfo.textContent += ` | ${resultados.length} resultado(s) para: "${query}"`;

        // Adicionar eventos aos resultados
        const resultItems = resultDiv.querySelectorAll('.result-item');
        resultItems.forEach(item => {
            item.addEventListener('click', function() {
                const codigoEp = this.getAttribute('data-codigo-ep');
                const goNumero = this.getAttribute('data-go-numero');

                // Copiar código EP para área de transferência
                navigator.clipboard.writeText(codigoEp).then(() => {
                    const input = document.getElementById('centroCustoSearch');

                    // Feedback visual
                    const originalBackground = this.style.backgroundColor;
                    this.style.backgroundColor = '#d4edda';

                    // Alterar texto de informação temporariamente
                    const originalInfo = searchInfo.textContent;
                    searchInfo.textContent = `✓ Código EP ${codigoEp} copiado (GO ${goNumero})`;
                    searchInfo.style.color = '#28a745';

                    setTimeout(() => {
                        this.style.backgroundColor = originalBackground;
                        searchInfo.textContent = originalInfo;
                        searchInfo.style.color = '';
                    }, 2000);

                    // Esconder resultados
                    setTimeout(() => {
                        resultDiv.style.display = 'none';
                    }, 500);

                }).catch(err => {
                    console.error('Erro ao copiar:', err);

                    // Fallback para navegadores mais antigos
                    const tempInput = document.createElement('textarea');
                    tempInput.value = codigoEp;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);

                    // Feedback mesmo com fallback
                    searchInfo.textContent = `Código EP ${codigoEp} copiado (GO ${goNumero})`;
                    searchInfo.style.color = '#28a745';
                    setTimeout(() => {
                        searchInfo.style.color = '';
                    }, 2000);
                });
            });

            // Adicionar hover com teclado (acessibilidade)
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });

            // Melhorar acessibilidade
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `Copiar código EP ${codigoEp} do GO ${goNumero}`);
        });
    }

    // Inicializar quando a página carregar
    window.addEventListener('load', function() {
        // Aguardar um pouco para garantir que a página carregou completamente
        setTimeout(criarInterface, 1000);
    });

    // Também tentar inicializar se a página já estiver carregada
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(criarInterface, 100);
    }
})();
