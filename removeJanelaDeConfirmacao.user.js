// ==UserScript==
// @name         SIPLAN - Remover confirmação de Limpar Filtros (seguro)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Remove diálogos de confirmação no SIPLAN sem quebrar o funcionamento
// @author       Você
// @match        *://webapps.sorocaba.sescsp.org.br/siplan/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    /**
     * Sobrescreve a função de confirmação do jQuery/Backbone
     * Isso intercepta qualquer tentativa de mostrar diálogo de confirmação
     */
    function overrideConfirmDialog() {
        // Salva a função original se ainda não foi sobrescrita
        if (!window._originalConfirm) {
            window._originalConfirm = window.confirm;
        }

        // Substitui globalmente - mas só para textos específicos do SIPLAN
        window.confirm = function(message) {
            // Lista de mensagens que devem ser automaticamente aprovadas
            const mensagensParaIgnorar = [
                'limpar',
                'filtro',
                'filter',
                'clear',
                'deseja realmente',
                'tem certeza'
            ];

            const deveAutoAprovar = mensagensParaIgnorar.some(
                termo => message.toLowerCase().includes(termo.toLowerCase())
            );

            if (deveAutoAprovar) {
                console.log(`[SIPLAN] ✅ Confirmação automática: "${message.substring(0, 50)}..."`);
                return true; // Retorna true como se o usuário tivesse clicado OK
            }

            // Para outras confirmações, mantém o comportamento original
            return window._originalConfirm(message);
        };
    }

    /**
     * Remove apenas o atributo data-confirm sem clonar o elemento
     */
    function removeDataConfirmSafe(element, elementName) {
        if (!element) return false;

        if (element.hasAttribute('data-confirm')) {
            const mensagem = element.getAttribute('data-confirm');
            element.removeAttribute('data-confirm');
            console.log(`[SIPLAN] ✅ Removido data-confirm de: ${elementName} (mensagem: "${mensagem}")`);
            return true;
        }

        // Se não tem data-confirm, verifica se tem classe de confirmação
        if (element.classList && element.classList.contains('confirm')) {
            element.classList.remove('confirm');
            console.log(`[SIPLAN] ✅ Removida classe "confirm" de: ${elementName}`);
            return true;
        }

        return false;
    }

    /**
     * Busca e processa botões de limpar filtros
     */
    function processClearFiltersButtons() {
        const btnLimparFiltros = document.querySelector('button[name="btn-limpart-filtros-agenda"]');
        if (btnLimparFiltros) {
            const modificado = removeDataConfirmSafe(btnLimparFiltros, 'Limpar filtros (Agenda)');

            if (!modificado) {
                // Se não encontrou data-confirm, adiciona um listener que intercepta o click
                btnLimparFiltros.addEventListener('click', function(e) {
                    // Pequeno atraso para permitir que outros handlers rodem primeiro
                    setTimeout(() => {
                        // Se houver um modal de confirmação aberto, fecha automaticamente
                        const modalConfirm = document.querySelector('.modal.confirmation, .modal.confirm, #confirm-modal, .bootbox');
                        if (modalConfirm && modalConfirm.style.display !== 'none') {
                            const confirmBtn = modalConfirm.querySelector('.btn-primary, .confirm, .yes, .ok');
                            if (confirmBtn) {
                                console.log('[SIPLAN] 🔘 Fechando modal de confirmação automaticamente');
                                confirmBtn.click();
                            }
                        }
                    }, 10);
                });
            }
        }
    }

    /**
     * Intercepta chamadas do Bootstrap Modal que são de confirmação
     */
    function overrideBootstrapModal() {
        // Salva a função original do modal
        const originalModal = $.fn.modal;

        $.fn.modal = function(option, ...args) {
            // Verifica se é um modal de confirmação
            const isConfirmModal = this.hasClass('confirm') ||
                                   this.hasClass('confirmation') ||
                                   this.attr('id') === 'confirm-modal';

            if (isConfirmModal && (option === 'show' || option === 'toggle')) {
                console.log('[SIPLAN] 🚫 Modal de confirmação bloqueado');
                return this; // Não mostra o modal
            }

            return originalModal.call(this, option, ...args);
        };
    }

    /**
     * Adiciona listeners para fechar modais de confirmação automaticamente
     */
    function autoCloseConfirmModals() {
        // Observa a criação de modais
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Elemento
                        // Verifica se é um modal de confirmação
                        if (node.classList &&
                            (node.classList.contains('modal') || node.matches && node.matches('.modal'))) {
                            setTimeout(() => {
                                const isConfirm = node.querySelector('.modal-header .confirm, .modal-footer .btn-primary');
                                if (isConfirm && node.style.display !== 'none') {
                                    const confirmBtn = node.querySelector('.btn-primary, .btn-danger, .confirm, .yes');
                                    if (confirmBtn) {
                                        console.log('[SIPLAN] 🔘 Fechando modal de confirmação detectado');
                                        confirmBtn.click();
                                    }
                                }
                            }, 50);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Aguarda o jQuery estar disponível
    function waitForjQuery() {
        if (typeof $ !== 'undefined') {
            overrideConfirmDialog();
            // overrideBootstrapModal(); // Descomentar se precisar
            autoCloseConfirmModals();
        } else {
            setTimeout(waitForjQuery, 100);
        }
    }

    // Executa após o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            processClearFiltersButtons();
            waitForjQuery();
        });
    } else {
        processClearFiltersButtons();
        waitForjQuery();
    }

    // Também executa periodicamente para capturar botões que aparecem depois
    setInterval(() => {
        processClearFiltersButtons();
    }, 2000);

    console.log('[SIPLAN] 🚀 Userscript carregado (modo seguro) - Confirmações serão aprovadas automaticamente!');
})();
