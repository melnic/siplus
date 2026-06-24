// ==UserScript==
// @name         Rajatur - Filtro Rápido Excursões/Passeios
// @namespace    bruno.sesc.rajatur
// @version      1.0
// @description  Adiciona botão fixo no menu para ir direto em Excursões/Passeios, filtrar pela Unidade Operadora e pesquisar
// @match        https://turismosocial-uo.sescsp.org.br/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ===================== CONFIGURAÇÃO =====================
  const UNIDADE_OPERADORA = 'Sesc Sorocaba';
  const ROTA_EXCURSOES = '#/main/excursoes-passeios';
  const CLICAR_PESQUISAR_AUTOMATICAMENTE = true;
  // ==========================================================

  const BTN_ID = 'btn-filtro-rapido-excursoes';

  // ---------- Utilitários genéricos ----------

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Espera até que document.querySelector(selector) retorne algo,
   * verificando o DOM repetidamente (a SPA renderiza de forma assíncrona).
   */
  function waitForElement(selector, { timeout = 10000, root = document } = {}) {
    return new Promise((resolve, reject) => {
      const existing = root.querySelector(selector);
      if (existing) {
        resolve(existing);
        return;
      }

      const observer = new MutationObserver(() => {
        const el = root.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(root === document ? document.body : root, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout esperando elemento: ${selector}`));
      }, timeout);
    });
  }

  /**
   * Espera até que uma condição (função) retorne true, checando em intervalos.
   */
  function waitForCondition(checkFn, { timeout = 10000, interval = 150 } = {}) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        let result;
        try {
          result = checkFn();
        } catch (e) {
          result = false;
        }
        if (result) {
          resolve(result);
          return;
        }
        if (Date.now() - start > timeout) {
          reject(new Error('Timeout esperando condição.'));
          return;
        }
        setTimeout(tick, interval);
      };
      tick();
    });
  }

  /**
   * Dispara eventos nativos para que Angular (zone.js) detecte a mudança.
   */
  function dispatchNativeEvent(el, eventType) {
    const ev = new Event(eventType, { bubbles: true, cancelable: true });
    el.dispatchEvent(ev);
  }

  function dispatchMouseEvent(el, eventType) {
    const ev = new MouseEvent(eventType, { bubbles: true, cancelable: true, view: window });
    el.dispatchEvent(ev);
  }

  function setNativeInputValue(inputEl, value) {
    // Necessário para inputs controlados por frameworks como Angular/React
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set;
    nativeInputValueSetter.call(inputEl, value);
    dispatchNativeEvent(inputEl, 'input');
  }

  // ---------- Lógica específica do ng-select ----------

  /**
   * Localiza um ng-select pelo texto do <label> associado (mesmo bloco .control-form).
   */
  function findNgSelectByLabel(labelText) {
    const labels = Array.from(document.querySelectorAll('.control-form label'));
    const label = labels.find(
      (l) => l.textContent && l.textContent.trim().toLowerCase().startsWith(labelText.toLowerCase())
    );
    if (!label) return null;
    const container = label.closest('.control-form');
    if (!container) return null;
    return container.querySelector('ng-select');
  }

  /**
   * Abre o ng-select, digita o termo de busca, espera as opções aparecerem
   * e clica na opção cujo texto corresponde (match exato ou "começa com").
   */
  async function selecionarNgSelect(ngSelectEl, textoOpcao) {
    if (!ngSelectEl) {
      throw new Error('ng-select não encontrado.');
    }

    // 1) Clica no container para abrir o dropdown
    const container = ngSelectEl.querySelector('.ng-select-container');
    if (!container) throw new Error('Container do ng-select não encontrado.');
    dispatchMouseEvent(container, 'mousedown');
    dispatchMouseEvent(container, 'mouseup');
    dispatchMouseEvent(container, 'click');

    // 2) Espera o input de busca interno aparecer e focar
    const input = await waitForElement('input', { root: ngSelectEl, timeout: 5000 });
    input.focus();

    // 3) Digita o texto de busca, caractere por caractere (mais fiel ao comportamento real)
    setNativeInputValue(input, '');
    for (const char of textoOpcao) {
      const atual = input.value + char;
      setNativeInputValue(input, atual);
      await sleep(40);
    }

    // 4) Espera o painel de opções (ng-dropdown-panel é anexado ao body, fora do ng-select)
    await sleep(300);
    const panel = await waitForElement('.ng-dropdown-panel .ng-option', { timeout: 5000 });

    // 5) Procura a opção com o texto certo dentre todas as renderizadas
    const opcoes = Array.from(document.querySelectorAll('.ng-dropdown-panel .ng-option'));
    const normalizar = (s) => s.trim().toLowerCase();
    let opcaoAlvo =
      opcoes.find((o) => normalizar(o.textContent) === normalizar(textoOpcao)) ||
      opcoes.find((o) => normalizar(o.textContent).includes(normalizar(textoOpcao)));

    if (!opcaoAlvo) {
      throw new Error(`Opção "${textoOpcao}" não encontrada na lista do ng-select.`);
    }

    dispatchMouseEvent(opcaoAlvo, 'mousedown');
    dispatchMouseEvent(opcaoAlvo, 'mouseup');
    dispatchMouseEvent(opcaoAlvo, 'click');

    // Pequena espera para o Angular processar a seleção
    await sleep(200);
  }

  // ---------- Fluxo principal ----------

  async function navegarParaExcursoes() {
    if (!window.location.hash.startsWith(ROTA_EXCURSOES)) {
      window.location.hash = ROTA_EXCURSOES;
      // Espera a navegação SPA renderizar o componente da tela
      await waitForElement('app-excursoes-passeios', { timeout: 8000 });
      // Pequena espera extra para os ng-select internos finalizarem o data-binding inicial
      await sleep(400);
    }
  }

  async function executarFiltroRapido() {
    const btn = document.getElementById(BTN_ID);
    const labelOriginal = btn ? btn.textContent : null;

    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Carregando...';
      }

      await navegarParaExcursoes();

      // Garante que o card de filtro já está no DOM
      await waitForElement('.control-form label', { timeout: 8000 });

      const ngSelectUnidade = await waitForCondition(
        () => findNgSelectByLabel('Unidade Operadora'),
        { timeout: 8000 }
      );

      await selecionarNgSelect(ngSelectUnidade, UNIDADE_OPERADORA);

      if (CLICAR_PESQUISAR_AUTOMATICAMENTE) {
        const botoes = Array.from(document.querySelectorAll('button.btn-filter'));
        const btnPesquisar = botoes.find((b) => b.textContent.trim() === 'Pesquisar');
        if (btnPesquisar) {
          dispatchMouseEvent(btnPesquisar, 'click');
        } else {
          console.warn('[Filtro Rápido] Botão "Pesquisar" não encontrado.');
        }
      }
    } catch (err) {
      console.error('[Filtro Rápido] Erro:', err);
      alert('Não foi possível aplicar o filtro automaticamente. Detalhe: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = labelOriginal || '🔎 Excursões (Sesc Sorocaba)';
      }
    }
  }

  // ---------- Injeção do botão no menu lateral ----------

  function criarBotao() {
    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.textContent = '🔎 Excursões (Sesc Sorocaba)';
    btn.style.cssText = [
      'display:block',
      'width:90%',
      'margin:4px auto 12px auto',
      'padding:8px 6px',
      'background-color:#003a69',
      'color:#fff',
      'border:1px solid #fff',
      'border-radius:6px',
      'cursor:pointer',
      'font-size:12px',
      'font-weight:600',
      'text-align:center',
      'white-space:normal',
      'line-height:1.3',
    ].join(';');

    btn.addEventListener('mouseenter', () => {
      btn.style.backgroundColor = '#0065a6';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.backgroundColor = '#003a69';
    });

    btn.addEventListener('click', () => {
      executarFiltroRapido();
    });

    return btn;
  }

  /**
   * Insere o botão como primeiro elemento dentro de .list-menu,
   * ou seja, ANTES do menu de itens (acima de "Início").
   */
  function inserirBotaoNoContainer(listMenu) {
    if (document.getElementById(BTN_ID)) return;
    const btn = criarBotao();
    listMenu.insertBefore(btn, listMenu.firstChild);
  }

  async function inserirBotaoNoMenu() {
    // .list-menu é o container que envolve o <p-tieredmenu> com os itens (Início, Cadastros, etc.)
    const listMenu = await waitForElement('.menu-component .list-menu', { timeout: 15000 });
    inserirBotaoNoContainer(listMenu);
  }

  // Como é uma SPA, o menu pode ser recriado entre navegações.
  // Observamos o body e garantimos que o botão sempre esteja presente, no topo do menu.
  function manterBotaoPersistente() {
    const observer = new MutationObserver(() => {
      if (!document.getElementById(BTN_ID)) {
        const listMenu = document.querySelector('.menu-component .list-menu');
        if (listMenu) {
          inserirBotaoNoContainer(listMenu);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ---------- Inicialização ----------

  inserirBotaoNoMenu().then(manterBotaoPersistente).catch((err) => {
    console.error('[Filtro Rápido] Falha ao inserir botão no menu:', err);
  });
})();
