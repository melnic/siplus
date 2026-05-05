// ==UserScript==
// @name         Biblioteca – Extrator (Passo 1)
// @namespace    sesc-sorocaba-biblioteca
// @version      2.0.0
// @description  Lê os relatórios de Cadastros e de Circulação,
//               consolida totais por data × coluna × linha e salva no localStorage.
// @match        *://*/*gerencial-usuarios-cadastrados*
// @match        *://*/*relatorio_semanal_biblioteca*
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ─── CHAVE DE ARMAZENAMENTO ────────────────────────────────────────────────
  const LS_KEY = 'bib_dados';

  // ─── MAPEAMENTO: categoria bruta → { coluna, linha } ─────────────────────
  //
  // Coluna : Pleno - Titular | Pleno - Dependente | MIS e Atividade | Não identificado
  // Linha  : PCG | Gratuito
  //
  const MAPA_CATEGORIA = {
    'SP - Bibliotecário DR':                                                                          { coluna: 'Pleno - Titular',    linha: 'Gratuito' },
    'SP - Conveniado':                                                                                { coluna: 'MIS e Atividade',    linha: 'Gratuito' },
    'SP - Dependente de Conveniado (maior de 14 anos)':                                               { coluna: 'MIS e Atividade',    linha: 'Gratuito' },
    'SP - Dependente de Conveniado (maior de 14 anos) PCG':                                           { coluna: 'MIS e Atividade',    linha: 'PCG'      },
    'SP - Dependente de Conveniado (menor de 14 anos) PCG':                                           { coluna: 'MIS e Atividade',    linha: 'PCG'      },
    'SP - Dependente de Público em Geral (maior de 14 anos)':                                         { coluna: 'Não identificado',   linha: 'Gratuito' },
    'SP - Dependente de Público em Geral (menor de 14 anos)':                                         { coluna: 'Não identificado',   linha: 'Gratuito' },
    'SP - Dependente de Trabalhador do Comércio de Bens, Serviços e Turismo (maior de 14 anos)':      { coluna: 'Pleno - Dependente', linha: 'Gratuito' },
    'SP - Dependente de Trabalhador do Comércio de Bens, Serviços e Turismo (maior de 14 anos) PCG':  { coluna: 'Pleno - Dependente', linha: 'PCG'      },
    'SP - Dependente de Trabalhador do Comércio de Bens, Serviços e Turismo (menor de 14 anos)':      { coluna: 'Pleno - Dependente', linha: 'Gratuito' },
    'SP - Dependente de Trabalhador do Comércio de Bens, Serviços e Turismo (menor de 14 anos) PCG':  { coluna: 'Pleno - Dependente', linha: 'PCG'      },
    'SP - Dependente em maior de 14 anos PCG':                                                        { coluna: 'Pleno - Dependente', linha: 'PCG'      },
    'SP - Dependente em menor de 14 anos PCG':                                                        { coluna: 'Pleno - Dependente', linha: 'PCG'      },
    'SP - Empregado':                                                                                 { coluna: 'Pleno - Titular',    linha: 'Gratuito' },
    'SP - Equipe de Atendimento':                                                                     { coluna: 'Pleno - Titular',    linha: 'Gratuito' },
    'SP - Público em Geral':                                                                          { coluna: 'Não identificado',   linha: 'Gratuito' },
    'SP - Trabalhador do Comércio, Bens e Serviços':                                                  { coluna: 'Pleno - Titular',    linha: 'Gratuito' },
    'SP - Trabalhador do Comércio, Bens e Serviços PCG':                                              { coluna: 'Pleno - Titular',    linha: 'PCG'      },
  };

  const COLUNAS = ['Pleno - Titular', 'Pleno - Dependente', 'MIS e Atividade', 'Não identificado'];
  const LINHAS  = ['PCG', 'Gratuito'];

  // ─── STORAGE ──────────────────────────────────────────────────────────────
  function lerStorage()       { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } }
  function salvarStorage(obj) { localStorage.setItem(LS_KEY, JSON.stringify(obj)); }

  // ─── PARSER DE TABELA HTML ────────────────────────────────────────────────
  /**
   * Recebe um <table> do DOM e retorna array de objetos,
   * usando a primeira linha com <th> como cabeçalho.
   */
  function tabelaParaObjetos(table) {
    const linhas = Array.from(table.querySelectorAll('tr'));

    const linhaCabecalho = linhas.find(tr => tr.querySelector('th'));
    if (!linhaCabecalho) return [];

    const headers = Array.from(linhaCabecalho.querySelectorAll('th, td'))
      .map(c => c.textContent.trim());

    const objetos = [];
    for (const tr of linhas) {
      if (tr === linhaCabecalho) continue;
      const cells = Array.from(tr.querySelectorAll('th, td')).map(c => c.textContent.trim());
      if (cells.every(c => !c)) continue;
      if (cells.length < Math.ceil(headers.length / 2)) continue;

      const obj = {};
      headers.forEach((h, i) => { obj[h] = (cells[i] ?? '').trim(); });
      objetos.push(obj);
    }
    return objetos;
  }

  /**
   * Lê os metadados de filtro (tabelas de cabeçalho do relatório).
   * Retorna { "Data inicial": "17/04/2026", "Data final": "23/04/2026", ... }
   */
  function lerFiltros(doc) {
    const filtros = {};
    for (const tbl of doc.querySelectorAll('table')) {
      for (const tr of tbl.querySelectorAll('tr')) {
        const cells = Array.from(tr.querySelectorAll('th, td')).map(c => c.textContent.trim());
        for (let i = 0; i + 1 < cells.length; i += 2) {
          const chave = cells[i].replace(/:$/, '').trim();
          const valor = cells[i + 1].trim();
          if (chave && valor) filtros[chave] = valor;
        }
      }
    }
    return filtros;
  }

  // ─── ESTRUTURA DE CONSOLIDADO ─────────────────────────────────────────────
  /**
   * Retorna objeto zerado com todas as combinações coluna × linha.
   * { "Pleno - Titular": { PCG: 0, Gratuito: 0 }, ... }
   */
  function estruturaZerada() {
    const obj = {};
    for (const col of COLUNAS) {
      obj[col] = {};
      for (const lin of LINHAS) obj[col][lin] = 0;
    }
    return obj;
  }

  /**
   * Incrementa consolidado[dia][coluna][linha].
   * Se a categoria não estiver no mapa, registra em semMapa.
   */
  function incrementar(consolidado, semMapa, dia, categoria) {
    if (!dia) return;

    const map = MAPA_CATEGORIA[categoria];
    if (!map) {
      semMapa.add(categoria);
      return;
    }

    if (!consolidado[dia]) consolidado[dia] = estruturaZerada();
    consolidado[dia][map.coluna][map.linha]++;
  }

  // ─── PROCESSAMENTO: GERENCIAL (Cadastros) ─────────────────────────────────
  //
  // Regra de data:
  //   "Data alteração" se preenchida → essa data
  //   Caso contrário  → "Data de cadastro"
  //
  function processarGerencial(doc) {
    const filtros = lerFiltros(doc);

    const tabelaDados = Array.from(doc.querySelectorAll('table')).find(tbl => {
      const ths = Array.from(tbl.querySelectorAll('th')).map(th => th.textContent.trim());
      return ths.includes('Status do usuário') && ths.includes('Matrícula');
    });

    if (!tabelaDados) return null;

    const rows = tabelaParaObjetos(tabelaDados)
      .filter(r => r['Status do usuário'] === 'Ativo' || r['Status do usuário'] === 'Inativo');

    const consolidado = {};
    const semMapa     = new Set();

    for (const r of rows) {
      const dia = r['Data alteração'] || r['Data de cadastro'] || '';
      incrementar(consolidado, semMapa, dia, r['Categoria de usuário']);
    }

    return {
      tipo:        'GERENCIAL',
      dataInicial: filtros['Data inicial'] || '',
      dataFinal:   filtros['Data final']   || '',
      totalLinhas: rows.length,
      consolidado,
      semMapa:     [...semMapa],
    };
  }

  // ─── PROCESSAMENTO: RELATÓRIO SEMANAL (Circulação) ───────────────────────
  //
  // Regra de data: "Data de circulação" (formato "DD/MM/YYYY HH:MM:SS" → só a data)
  // Deduplicação : exemplar + data/hora + matrícula
  //
  function processarRelatorio(doc) {
    const filtros = lerFiltros(doc);

    const tabelaDados = Array.from(doc.querySelectorAll('table')).find(tbl => {
      const ths = Array.from(tbl.querySelectorAll('th')).map(th => th.textContent.trim());
      return ths.includes('Tipo de circulação') && ths.includes('Matrícula do usuário');
    });

    if (!tabelaDados) return null;

    const vistos = new Set();
    const rows   = tabelaParaObjetos(tabelaDados).filter(r => {
      if (r['Tipo de circulação'] !== 'Empréstimo' && r['Tipo de circulação'] !== 'Renovação') return false;
      const chave = `${r['Código do exemplar']}|${r['Data de circulação']}|${r['Matrícula do usuário']}`;
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });

    const consolidado = {};
    const semMapa     = new Set();

    for (const r of rows) {
      const dia = (r['Data de circulação'] || '').split(' ')[0]; // DD/MM/YYYY
      incrementar(consolidado, semMapa, dia, r['Categoria de usuário']);
    }

    return {
      tipo:        'RELATORIO',
      dataInicial: filtros['Data inicial'] || '',
      dataFinal:   filtros['Data final']   || '',
      totalLinhas: rows.length,
      consolidado,
      semMapa:     [...semMapa],
    };
  }

  // ─── PAINEL DE RESULTADO ──────────────────────────────────────────────────
  function mostrarPainel(html, tipo = 'info') {
    const cores = { info: '#2980b9', ok: '#27ae60', erro: '#c0392b' };
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

  function montarResumo(dados) {
    const label = dados.tipo === 'GERENCIAL' ? 'Cadastros' : 'Circulação';
    let html = `<b>${label}</b> — ${dados.dataInicial} → ${dados.dataFinal}<br>`;
    html += `${dados.totalLinhas} registros processados<br><br>`;

    for (const dia of Object.keys(dados.consolidado).sort()) {
      html += `<b>${dia}</b><br>`;
      const bloco = dados.consolidado[dia];
      for (const col of COLUNAS) {
        for (const lin of LINHAS) {
          const v = bloco[col][lin];
          if (v > 0) html += `&nbsp;&nbsp;${col} / ${lin}: ${v}<br>`;
        }
      }
    }

    if (dados.semMapa.length) {
      html += `<br>⚠️ Categorias sem mapeamento:<br>`;
      dados.semMapa.forEach(c => { html += `&nbsp;&nbsp;${c}<br>`; });
    }

    return html;
  }

  // ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────
  function init() {
    const url = window.location.href;
    let dados = null;
    let chave = null;

    if (/gerencial-usuarios-cadastrados/i.test(url)) {
      dados = processarGerencial(document);
      chave = 'gerencial';
    } else if (/relatorio_semanal_biblioteca/i.test(url)) {
      dados = processarRelatorio(document);
      chave = 'relatorio';
    } else {
      return;
    }

    if (!dados) {
      mostrarPainel('⚠️ Tabela de dados não encontrada.', 'erro');
      return;
    }

    // Salvar mantendo o que já existia para o outro relatório
    const storage = lerStorage();
    storage[chave]       = dados;
    storage.atualizadoEm = new Date().toLocaleString('pt-BR');
    salvarStorage(storage);

    mostrarPainel(montarResumo(dados), 'ok');

    console.log(`[BIB] ${chave} →`, dados);
    console.log(`[BIB] localStorage["${LS_KEY}"] →`, lerStorage());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
