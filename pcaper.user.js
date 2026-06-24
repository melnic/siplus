// ==UserScript==
// @name         PCAP Pré-Proposta - Autopreencher Local da Atividade (SESC SOROCABA)
// @namespace    bruno.sesc.sorocaba
// @version      1.0
// @description  Ao carregar o quadro de Pré-Proposta, seleciona automaticamente "SESC SOROCABA" no campo "Local da Atividade (unidade ou cidade)".
// @author       Bruno Melnic Incao
// @match        https://sescspapexprd.sescsp.org.br:8443/ords/r/spcap/spcap/pre-proposta*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ID do item APEX (select) do campo "Local da Atividade (unidade ou cidade)"
  const ITEM_ID = 'P10_UOR_CODIGO_LOCAL';
  // value correspondente a "SESC SOROCABA" na lista de opções desse campo
  const VALOR_SESC_SOROCABA = '96';

  // Quantas vezes (e com qual intervalo) tentar antes de desistir,
  // já que a página APEX pode levar um instante para terminar de montar
  // os widgets de Dynamic Actions / itens dependentes.
  const MAX_TENTATIVAS = 20;
  const INTERVALO_MS = 250;

  let tentativas = 0;

  function preencherLocal() {
    tentativas++;

    const select = document.getElementById(ITEM_ID);

    if (!select) {
      if (tentativas < MAX_TENTATIVAS) {
        setTimeout(preencherLocal, INTERVALO_MS);
      }
      return;
    }

    // Se já estiver preenchido (ex.: ao reabrir uma proposta existente),
    // não sobrescreve o valor.
    if (select.value && select.value !== '') {
      return;
    }

    // Confirma que a opção "SESC SOROCABA" existe nesse select antes de tentar setar.
    const opcaoExiste = Array.from(select.options).some(
      (opt) => opt.value === VALOR_SESC_SOROCABA
    );

    if (!opcaoExiste) {
      console.warn('[PCAP Autofill] Opção SESC SOROCABA (value=96) não encontrada no campo', ITEM_ID);
      return;
    }

    // Usa a API oficial do APEX quando disponível: ela atualiza o widget visual
    // (o select é renderizado com data-native-menu="false", ou seja, há um
    // componente customizado por cima do <select> nativo) e dispara os eventos
    // "change" necessários para qualquer Dynamic Action vinculada ao item.
    if (window.apex && window.apex.item) {
      try {
        window.apex.item(ITEM_ID).setValue(VALOR_SESC_SOROCABA);
        console.log('[PCAP Autofill] Local da Atividade definido como SESC SOROCABA via apex.item().');
        return;
      } catch (e) {
        console.warn('[PCAP Autofill] Falha ao usar apex.item().setValue, tentando fallback nativo.', e);
      }
    }

    // Fallback: define direto no DOM e dispara o evento change manualmente,
    // para o caso de a API apex.item ainda não estar disponível.
    select.value = VALOR_SESC_SOROCABA;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('[PCAP Autofill] Local da Atividade definido como SESC SOROCABA via fallback DOM.');
  }

  preencherLocal();
})();
