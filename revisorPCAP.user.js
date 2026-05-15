// ==UserScript==
// @name         Analisador de Percentuais - Destaque >10%
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Analisa elementos com percentuais e destaca se maior que 10%
// @author       Você
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configurações
    const CONFIG = {
        limitePercentual: 10,        // Limite de alerta (10%)
        corDestaque: '#ffcccc',      // Cor de fundo para >10%
        bordaDestaque: '2px solid #ff0000',
        alertaConsole: true,          // Mostrar alerta no console
        alertaPopup: true,            // Mostrar alerta popup
        tooltipInfo: true             // Mostrar tooltip com informações
    };

    // Função para extrair percentual do texto
    function extrairPercentual(texto) {
        // Procura padrões como (21,68%) ou (21.68%) ou 21,68%
        const regex = /\((\d+[,.]?\d*)%\)/;
        const match = texto.match(regex);
        
        if (match) {
            // Converte vírgula para ponto
            let valorStr = match[1].replace(',', '.');
            let valor = parseFloat(valorStr);
            return isNaN(valor) ? null : valor;
        }
        
        // Tenta capturar sem parênteses
        const regex2 = /(\d+[,.]?\d*)%/;
        const match2 = texto.match(regex2);
        if (match2) {
            let valorStr = match2[1].replace(',', '.');
            let valor = parseFloat(valorStr);
            return isNaN(valor) ? null : valor;
        }
        
        return null;
    }

    // Função para extrair o valor monetário
    function extrairValor(texto) {
        const regex = /R?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/;
        const match = texto.match(regex);
        if (match) {
            let valorStr = match[1].replace(/\./g, '').replace(',', '.');
            return parseFloat(valorStr);
        }
        return null;
    }

    // Função para destacar o elemento
    function destacarElemento(elemento, percentual, valor) {
        // Salvar estilos originais
        const originalBg = elemento.style.backgroundColor;
        const originalBorder = elemento.style.border;
        
        // Aplicar destaque
        elemento.style.backgroundColor = CONFIG.corDestaque;
        elemento.style.border = CONFIG.bordaDestaque;
        elemento.style.transition = 'all 0.3s ease';
        
        // Adicionar tooltip com informações
        if (CONFIG.tooltipInfo) {
            elemento.setAttribute('title', `⚠️ Percentual: ${percentual}% (ACIMA DO LIMITE DE ${CONFIG.limitePercentual}%)${valor ? ` | Valor: R$ ${valor.toFixed(2)}` : ''}`);
        }
        
        // Adicionar classe CSS para identificação
        elemento.classList.add('percentual-alto');
        
        // Criar indicador visual (badge)
        criarBadge(elemento, percentual, valor);
        
        // Piscar o elemento 3 vezes
        piscarElemento(elemento);
        
        // Mostrar alerta
        if (CONFIG.alertaPopup) {
            mostrarAlerta(percentual, valor, elemento);
        }
        
        // Log no console
        if (CONFIG.alertaConsole) {
            console.warn(`⚠️ ALERTA: Percentual ${percentual}% excede o limite de ${CONFIG.limitePercentual}%`, {
                elemento: elemento,
                texto: elemento.textContent,
                percentual: percentual,
                valor: valor
            });
        }
        
        // Adicionar evento de clique para mais detalhes
        elemento.addEventListener('click', () => {
            mostrarDetalhes(elemento, percentual, valor);
        });
    }

    // Função para criar badge indicador
    function criarBadge(elemento, percentual, valor) {
        // Verificar se já existe badge
        if (elemento.querySelector('.percent-badge')) return;
        
        const badge = document.createElement('span');
        badge.className = 'percent-badge';
        badge.textContent = `⚠️ ${percentual}% > ${CONFIG.limitePercentual}%`;
        badge.style.cssText = `
            position: absolute;
            top: -10px;
            right: -10px;
            background: #ff0000;
            color: white;
            font-size: 10px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 10px;
            z-index: 1000;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            pointer-events: none;
        `;
        
        // Garantir que o elemento pai tenha position relativo
        if (getComputedStyle(elemento).position === 'static') {
            elemento.style.position = 'relative';
        }
        
        elemento.appendChild(badge);
        
        // Remover badge após 5 segundos
        setTimeout(() => {
            if (badge && badge.parentNode) {
                badge.remove();
            }
        }, 5000);
    }

    // Função para piscar o elemento
    function piscarElemento(elemento) {
        let flashes = 0;
        const originalBorder = elemento.style.border;
        const originalBg = elemento.style.backgroundColor;
        
        const interval = setInterval(() => {
            if (flashes >= 6) { // 3 piscadas (on/off)
                clearInterval(interval);
                return;
            }
            
            if (flashes % 2 === 0) {
                elemento.style.border = '3px solid #ff0000';
                elemento.style.backgroundColor = '#ffff00';
            } else {
                elemento.style.border = originalBorder;
                elemento.style.backgroundColor = originalBg;
            }
            
            flashes++;
        }, 300);
    }

    // Função para mostrar alerta popup
    function mostrarAlerta(percentual, valor, elemento) {
        const mensagem = `⚠️ ALERTA: Percentual de ${percentual}% excede o limite de ${CONFIG.limitePercentual}%!${valor ? `\nValor: R$ ${valor.toFixed(2)}` : ''}`;
        
        // Criar notificação flutuante
        const notificacao = document.createElement('div');
        notificacao.textContent = mensagem;
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.5s ease;
            max-width: 400px;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        
        // Adicionar animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notificacao);
        
        // Remover após 5 segundos
        setTimeout(() => {
            notificacao.remove();
        }, 5000);
        
        // Opcional: alert nativo (menos intrusivo)
        // alert(mensagem);
    }

    // Mostrar detalhes em modal
    function mostrarDetalhes(elemento, percentual, valor) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10001;
            max-width: 500px;
            min-width: 300px;
            font-family: Arial, sans-serif;
        `;
        
        modal.innerHTML = `
            <h3 style="color: #ff0000; margin-top: 0;">⚠️ Percentual Elevado</h3>
            <p><strong>Percentual:</strong> ${percentual}%</p>
            ${valor ? `<p><strong>Valor:</strong> R$ ${valor.toFixed(2)}</p>` : ''}
            <p><strong>Texto completo:</strong></p>
            <p style="background: #f0f0f0; padding: 10px; border-radius: 4px;">${elemento.textContent.trim()}</p>
            <p><strong>Elemento:</strong> &lt;${elemento.tagName.toLowerCase()}&gt; com classe(s): ${elemento.className || 'nenhuma'}</p>
            <button id="close-modal" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Fechar</button>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('close-modal').onclick = () => {
            modal.remove();
        };
        
        // Fechar ao clicar fora
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    // Função principal para analisar elementos
    function analisarElementos() {
        // Busca por qualquer elemento que contenha percentual
        // Você pode ajustar o seletor conforme necessário
        const seletores = [
            'td', 'div', 'span', 'p', 'li', 'tr', 'th', 
            '.percentual', '.porcentagem', '[class*="valor"]'
        ];
        
        const elementosEncontrados = new Set(); // Evitar duplicatas
        
        seletores.forEach(seletor => {
            document.querySelectorAll(seletor).forEach(elemento => {
                const texto = elemento.textContent;
                const percentual = extrairPercentual(texto);
                
                if (percentual !== null && percentual > CONFIG.limitePercentual) {
                    // Evitar processar o mesmo elemento múltiplas vezes
                    if (!elementosEncontrados.has(elemento)) {
                        elementosEncontrados.add(elemento);
                        
                        const valor = extrairValor(texto);
                        console.log(`🔍 Elemento encontrado: ${percentual}% > ${CONFIG.limitePercentual}%`, elemento);
                        destacarElemento(elemento, percentual, valor);
                    }
                }
            });
        });
        
        if (elementosEncontrados.size > 0) {
            console.log(`✅ Total de elementos com percentual > ${CONFIG.limitePercentual}%: ${elementosEncontrados.size}`);
        }
    }

    // Criar botão de controle
    function criarBotaoControle() {
        const btn = document.createElement('button');
        btn.textContent = '📊 Analisar Percentuais (>10%)';
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            padding: 10px 15px;
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
        `;
        
        btn.onclick = () => {
            analisarElementos();
            alert('✅ Análise concluída! Elementos com percentual >10% foram destacados em vermelho.');
        };
        
        document.body.appendChild(btn);
    }

    // Observar mudanças no DOM para novos elementos
    function observarMudancas() {
        const observer = new MutationObserver((mutations) => {
            let deveAnalisar = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    deveAnalisar = true;
                }
            });
            
            if (deveAnalisar) {
                setTimeout(() => analisarElementos(), 500);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Inicializar
    function init() {
        console.log('✅ Userscript de análise de percentuais carregado');
        console.log(`📊 Limite configurado: ${CONFIG.limitePercentual}%`);
        
        // Aguardar DOM carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    analisarElementos();
                    criarBotaoControle();
                    observarMudancas();
                }, 1000);
            });
        } else {
            setTimeout(() => {
                analisarElementos();
                criarBotaoControle();
                observarMudancas();
            }, 1000);
        }
    }
    
    init();
})();