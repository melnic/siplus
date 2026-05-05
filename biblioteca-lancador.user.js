// ==UserScript==
// @name         Biblioteca – Lançador (Passo 2)
// @namespace    sesc-sorocaba-biblioteca
// @version      1.0.0
// @description  Lê os dados consolidados do localStorage (gerados pelo Passo 1),
//               detecta a data da sessão aberta no Estatístico e preenche os campos.
// @match        *://webapps.sorocaba.sescsp.org.br/estatistico/*
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ─── CONFIGURAÇÃO ──────────────────────────────────────────────────────────

  const LS_KEY = 'bib_dados'; // mesma chave do Passo 1

  // Ordem das colunas como aparecem da esquerda para a direita no formulário
  const ORDEM_COLUNAS = [
    'Pleno - Titular',
    'Pleno - Dependente',
    'MIS e Atividade',
    'Não identificado',
  ];

  // ─── STORAGE ───────────────────────────────────────────────────────────────

  function lerStorage() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
  }

  // ─── DETECTAR DATA DA SESSÃO ───────────────────────────────────────────────
  // O formulário exibe algo como: "Biblioteca, 23/04/2026 às 09h às 21h30"
  // Extraímos o DD/MM/YYYY desse span.

  function detectarDataSessao() {
    // Busca todos os spans e procura o padrão de data da sessão
    const spans = document.querySelectorAll('span.ng-binding, p span.ng-binding, p');
    for (const el of spans) {
      const texto = el.textContent || '';
      const match = texto.match(/(\d{2}\/\d{2}\/\d{4})\s+às/);
      if (match) return match[1]; // DD/MM/YYYY
    }

    // Fallback: qualquer elemento com o padrão "texto, DD/MM/YYYY às"
    const tudo = document.body.innerText || '';
    const match = tudo.match(/,\s*(\d{2}\/\d{2}\/\d{4})\s+às/);
    return match ? match[1] : null;
  }

  // ─── PREENCHER CAMPO ANGULAR ────────────────────────────────────────────────
  // O formulário usa AngularJS (ng-model). Simples atribuição de value não dispara
  // o digest. Precisamos usar o setter nativo + disparar eventos input/change.

  function preencherCampo(input, valor) {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    ).set;
    setter.call(input, String(valor));
    input.dispatchEvent(new Event('input',  { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // ─── LOCALIZAR SEÇÃO PELO TÍTULO h5 ────────────────────────────────────────

  function encontrarSecao(tituloH5) {
    for (const h5 of document.querySelectorAll('h5.ng-binding')) {
      if (h5.textContent.trim() === tituloH5) {
        return h5.closest('section');
      }
    }
    return null;
  }

  // ─── PREENCHER UMA SEÇÃO (PCG / Gratuito) × 4 COLUNAS ────────────────────
  // Estrutura do DOM dentro de cada <section>:
  //   <tbody>
  //     <tr>  ← linha PCG
  //       <td><span>PCG</span></td>
  //       <td><input></td>   ← Pleno - Titular
  //       <td><input></td>   ← Pleno - Dependente
  //       <td><input></td>   ← MIS e Atividade
  //       <td><input></td>   ← Não identificado
  //       <td><span>total</span></td>
  //     </tr>
  //     <tr>  ← linha Gratuito
  //     ...
  //     <tr>  ← linha Pago (não usamos — não há dados)

  function preencherSecao(tituloH5, blocoConsolidado) {
    // blocoConsolidado = { "Pleno - Titular": { PCG: N, Gratuito: N }, ... }

    const secao = encontrarSecao(tituloH5);
    if (!secao) {
      console.warn(`[BIB] Seção "${tituloH5}" não encontrada.`);
      return false;
    }

    const linhas = Array.from(secao.querySelectorAll('tbody tr'))
      .filter(tr => tr.querySelector('span.ng-binding')); // só linhas com rótulo

    let preenchidos = 0;

    for (const tr of linhas) {
      const rotuloEl = tr.querySelector('td span.ng-binding');
      if (!rotuloEl) continue;
      const rotulo = rotuloEl.textContent.trim(); // "PCG", "Gratuito" ou "Pago"

      const inputs = Array.from(tr.querySelectorAll('input[type="text"]'));

      // Para cada coluna na ordem definida
      ORDEM_COLUNAS.forEach((coluna, idx) => {
        const input = inputs[idx];
        if (!input) return;

        const valor = blocoConsolidado?.[coluna]?.[rotulo] ?? 0;
        preencherCampo(input, valor);
        preenchidos++;
      });
    }

    return preenchidos > 0;
  }

  // ─── PREENCHER "Número de conteúdos acessados" ────────────────────────────
  // Essa seção tem h5 vazio e apenas 1 input (sem colunas de tipo).
  // Valor = total geral de circulações do dia (empréstimos + renovações).

  function preencherConteudos(totalDia) {
    for (const span of document.querySelectorAll('span.ng-binding')) {
      if (span.textContent.trim() === 'Número de conteúdos acessados') {
        const input = span.closest('tr')?.querySelector('input[type="text"]');
        if (input) {
          preencherCampo(input, totalDia);
          return true;
        }
      }
    }
    console.warn('[BIB] Campo "Número de conteúdos acessados" não encontrado.');
    return false;
  }

  // ─── CALCULAR TOTAL DE CIRCULAÇÕES DO DIA ──────────────────────────────────

  function totalDoDia(blocoConsolidado) {
    let total = 0;
    for (const coluna of ORDEM_COLUNAS) {
      for (const linha of ['PCG', 'Gratuito']) {
        total += blocoConsolidado?.[coluna]?.[linha] ?? 0;
      }
    }
    return total;
  }

  // ─── PAINEL FLUTUANTE ──────────────────────────────────────────────────────

  function mostrarPainel(html, tipo = 'info') {
    const cores = { info: '#2980b9', ok: '#27ae60', erro: '#c0392b', aviso: '#e67e22' };
    document.getElementById('bib-painel')?.remove();

    const el = document.createElement('div');
    el.id = 'bib-painel';
    el.style.cssText = `
      position:fixed; bottom:20px; right:20px; z-index:99999;
      background:${cores[tipo]}; color:#fff; padding:14px 18px;
      border-radius:8px; font:13px/1.6 sans-serif; max-width:460px;
      box-shadow:0 4px 16px rgba(0,0,0,.4);
    `;
    el.innerHTML = html
      + '<br><span style="font-size:11px;opacity:.7;cursor:pointer" '
      + 'onclick="this.parentElement.remove()">[fechar]</span>';
    document.body.appendChild(el);
  }

  // ─── BOTÃO FLUTUANTE ───────────────────────────────────────────────────────

  function criarBotao() {
    if (document.getElementById('bib-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'bib-btn';
    btn.textContent = '📚 Lançar Biblioteca';
    btn.style.cssText = `
      position:fixed; top:80px; right:16px; z-index:99999;
      background:#1a7bbf; color:#fff; border:none; border-radius:6px;
      padding:10px 16px; font:bold 13px sans-serif;
      cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.35);
    `;
    btn.onclick = lancar;
    document.body.appendChild(btn);
  }

  // ─── LANÇAMENTO PRINCIPAL ──────────────────────────────────────────────────

  function lancar() {
    // 1. Ler dados salvos
    const storage = lerStorage();
    if (!storage.gerencial && !storage.relatorio) {
      mostrarPainel(
        '⚠️ Nenhum dado encontrado.<br>Abra primeiro os relatórios gerencial e semanal.',
        'erro'
      );
      return;
    }

    // 2. Detectar data da sessão aberta
    const dataSessao = detectarDataSessao();
    if (!dataSessao) {
      mostrarPainel('⚠️ Não foi possível detectar a data desta sessão.', 'erro');
      return;
    }

    const linhas = [`<b>Sessão: ${dataSessao}</b><br>`];
    let algumPreenchido = false;

    // 3. INSCRITOS NO DIA ← dados do Gerencial
    const blocoGer = storage.gerencial?.consolidado?.[dataSessao];
    if (blocoGer) {
      const ok = preencherSecao('Inscritos no dia', blocoGer);
      if (ok) {
        linhas.push('✅ Inscritos no dia preenchido');
        algumPreenchido = true;
      }
    } else {
      linhas.push('⚠️ Sem dados de cadastro para ' + dataSessao);
    }

    // 4. PRESENÇAS ← dados do Relatório (circulação)
    const blocoRel = storage.relatorio?.consolidado?.[dataSessao];
    if (blocoRel) {
      const ok = preencherSecao('Presenças', blocoRel);
      if (ok) {
        linhas.push('✅ Presenças preenchido');
        algumPreenchido = true;
      }

      // 5. NÚMERO DE CONTEÚDOS ACESSADOS ← total de circulações do dia
      const total = totalDoDia(blocoRel);
      const okC = preencherConteudos(total);
      if (okC) {
        linhas.push(`✅ Conteúdos acessados: ${total}`);
      }
    } else {
      linhas.push('⚠️ Sem dados de circulação para ' + dataSessao);
    }

    if (!algumPreenchido) {
      linhas.push('<br>Nenhum campo foi preenchido. Verifique se os relatórios da semana correta foram processados.');
    }

    linhas.push(`<br><i>Atualizado em: ${storage.atualizadoEm || '?'}</i>`);
    mostrarPainel(linhas.join('<br>'), algumPreenchido ? 'ok' : 'aviso');
  }

  // ─── INICIALIZAÇÃO ─────────────────────────────────────────────────────────
  // O formulário é Angular e pode demorar a renderizar.
  // Tentamos criar o botão em dois momentos: rápido e com delay.

  function init() {
    criarBotao();

    // Se já há dados salvos, avisa o usuário após o Angular carregar
    setTimeout(() => {
      const storage = lerStorage();
      const tem = storage.gerencial || storage.relatorio;
      if (!tem) return;

      const data = detectarDataSessao();
      const partes = [];
      if (storage.gerencial) partes.push('Cadastros');
      if (storage.relatorio) partes.push('Circulação');

      mostrarPainel(
        `📋 Dados disponíveis: <b>${partes.join(' + ')}</b><br>` +
        (data ? `Sessão detectada: <b>${data}</b><br>` : '⚠️ Data da sessão não detectada ainda<br>') +
        `Clique em "📚 Lançar Biblioteca" para preencher.`,
        'info'
      );
    }, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
