// ==UserScript==
// @name         Estatístico - Auto Aprovar
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Remove a confirmação ao clicar em aprovar no sistema Estatístico
// @author       Você
// @match        *://webapps.sorocaba.sescsp.org.br/estatistico/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Função para interceptar e substituir a função confirm
    const originalConfirm = window.confirm;

    // Função que verifica se é uma confirmação de aprovação
    function isApprovalConfirm(message) {
        if (!message || typeof message !== 'string') return false;
        // Verifica padrões comuns de mensagem de aprovação
        const approvalPatterns = [
            /aprovar/i,
            /approve/i,
            /confirmar aprovação/i,
            /deseja aprovar/i,
            /tem certeza.*aprovar/i,
            /confirm.*approval/i
        ];
        return approvalPatterns.some(pattern => pattern.test(message));
    }

    // Substitui a função confirm globalmente
    window.confirm = function(message) {
        if (isApprovalConfirm(message)) {
            console.log('[AutoAprovar] Confirmação de aprovação interceptada e auto-aceita:', message);
            return true; // Retorna true como se o usuário tivesse clicado em OK
        }
        return originalConfirm.call(this, message);
    };

    // Também intercepta o modal do Bootstrap se existir
    function interceptBootstrapModal() {
        // Observa a criação de modais
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // Verifica se é um modal de confirmação
                        if (node.classList && (
                            node.classList.contains('modal') ||
                            node.classList.contains('modal-dialog') ||
                            (node.querySelector && node.querySelector('.modal-content'))
                        )) {
                            setTimeout(function() {
                                const modalText = node.innerText || node.textContent;
                                if (modalText && isApprovalConfirm(modalText)) {
                                    console.log('[AutoAprovar] Modal de aprovação detectado');
                                    // Tenta encontrar e clicar no botão de confirmação
                                    const confirmBtn = node.querySelector('.btn-primary, .btn-success, .confirm-btn, button[ng-click*="confirmar"], button[ng-click*="aprovar"]');
                                    if (confirmBtn) {
                                        setTimeout(function() {
                                            console.log('[AutoAprovar] Clicando no botão de confirmação do modal');
                                            confirmBtn.click();
                                        }, 100);
                                    }
                                    // Fecha o modal se necessário
                                    const closeBtn = node.querySelector('.modal-header .close, [data-dismiss="modal"]');
                                    if (closeBtn) {
                                        setTimeout(function() {
                                            closeBtn.click();
                                        }, 200);
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

    // Intercepta diretamente o evento de clique no botão aprovar
    function interceptApproveButton() {
        // Usa um observer para detectar quando os botões são carregados
        const buttonObserver = new MutationObserver(function() {
            const approveButtons = document.querySelectorAll(
                'button[ng-click*="aprovar"], ' +
                'button[ng-click*="Aprovar"], ' +
                'button:has(> span:contains("Aprovar")), ' +
                '.btn-secondary[ng-click*="aprovar"]'
            );

            approveButtons.forEach(function(btn) {
                if (!btn.hasAttribute('data-auto-approve-intercepted')) {
                    btn.setAttribute('data-auto-approve-intercepted', 'true');

                    // Salva o handler original e substitui
                    const originalNgClick = btn.getAttribute('ng-click');
                    if (originalNgClick && originalNgClick.includes('aprovar')) {
                        // Cria um novo botão que clica diretamente na função sem confirm
                        btn.addEventListener('click', function(e) {
                            // Se o evento já foi processado pelo nosso script, não faz nada
                            if (e.target.hasAttribute('data-auto-approve-clicked')) {
                                return;
                            }

                            console.log('[AutoAprovar] Botão Aprovar clicado - processando automaticamente');

                            // Encontra o escopo Angular e chama a função diretamente se possível
                            const scope = angular.element(btn).scope();
                            if (scope && scope.vm && typeof scope.vm.aprovar === 'function') {
                                e.preventDefault();
                                e.stopPropagation();
                                e.target.setAttribute('data-auto-approve-clicked', 'true');
                                scope.vm.aprovar();
                                setTimeout(function() {
                                    e.target.removeAttribute('data-auto-approve-clicked');
                                }, 500);
                            }
                        }, true); // Captura na fase de captura
                    }
                }
            });
        });

        buttonObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Função para interceptar chamadas $mdDialog do Angular Material
    function interceptAngularDialog() {
        // Aguarda o Angular carregar
        const interval = setInterval(function() {
            if (typeof angular !== 'undefined') {
                clearInterval(interval);
                // Obtém o módulo e decorre o $mdDialog
                try {
                    const appModule = angular.module('app');
                    if (appModule) {
                        appModule.config(['$provide', function($provide) {
                            $provide.decorator('$mdDialog', ['$delegate', function($delegate) {
                                const originalShow = $delegate.show;
                                const originalConfirm = $delegate.confirm;

                                $delegate.show = function(config) {
                                    if (config && config.parent && config.parent.length) {
                                        const dialogText = config.parent.text() || config.template || '';
                                        if (isApprovalConfirm(dialogText)) {
                                            console.log('[AutoAprovar] $mdDialog de aprovação interceptado');
                                            // Resolve automaticamente
                                            if (typeof config.controller === 'function') {
                                                // Tenta resolver
                                                return Promise.resolve();
                                            }
                                        }
                                    }
                                    return originalShow.call(this, config);
                                };

                                return $delegate;
                            }]);
                        }]);
                    }
                } catch(e) {
                    console.log('[AutoAprovar] Não foi possível decorar $mdDialog:', e);
                }
            }
        }, 500);
    }

    // Inicializa todas as interceptações
    setTimeout(function() {
        interceptBootstrapModal();
        interceptApproveButton();
        interceptAngularDialog();
        console.log('[AutoAprovar] Script ativado - Caixa de confirmação de aprovação será automaticamente aceita');
    }, 1000);

})();
