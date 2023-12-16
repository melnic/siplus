// ==UserScript==
// @name         Gerador de Carta Proposta
// @namespace    http://tampermonkey.net/
// @version      23.12.14
// @description  Obtem dados para carta proposta e lança no clipboard
// @author       You
// @match        http://webapps.sorocaba.sescsp.org.br/siplan/*
// @grant        none
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require     https://raw.githubusercontent.com/jeresig/jquery.hotkeys/master/jquery.hotkeys.js
// @downloadURL https://github.com/melnic/siplus/raw/master/carta_proposta.user.js
// @updateURL   https://github.com/melnic/siplus/raw/master/carta_proposta.user.js
// @grant       GM_addStyle
// ==/UserScript==


// MELHORIAS E FUNCIONALIDADES
// Insere parcelamento de valores
// 12/7 Retira dados de Licença de Exibição
// 18/7 Corrigido conversão de float para reais
// Corrige ano nas cartas a partir de 2024

waitForKeyElements ("#btn-export", inserirBotao);

var adress = window.location.href;
var patt = /96\d{12}/i;
var n_acao = patt.exec(adress);
var link_acao = "http://webapps.sorocaba.sescsp.org.br/siplan/api/atividade/" + n_acao;
var resposta = '';
//Office URI Schemes
const template_link = "ms-word:nft|u|https://sescsp.sharepoint.com/sites/NcleoArtstico-SescSorocaba/Shared%20Documents/Adm%20Programa%C3%A7%C3%A3o/Cartas%20Proposta/teste%20-%20CP%20-%20Universal%20Macro.dotm";

// Monitorar requisições JSON
// Filtrar solicitações com base na URL
// Endereço de calendário /siplan/api/atividade?start=08%2F05%2F2023&end=15%2F05%2F2023
// URL de ação /siplan/api/atividade/96000309122407?

var open = XMLHttpRequest.prototype.open;
//alert('função foi injetada');
XMLHttpRequest.prototype.open = function(method, url, async) {
    //alert(url);
    if (url.indexOf('api/atividade/96') !== -1) {
        //alert('Solicitação obtida:', method, url);

        // Adicionar observador de eventos para a resposta
        this.addEventListener('load', function() {
            resposta = this.responseText;
        });
    }
    open.apply(this, arguments);
};

//Função para obter dados de Ações
var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

//Como utilizar a função getJSON: Funcional CTRL + I Busca dados da ação
$(document).bind('keydown', 'ctrl+i', function(event){

    event.preventDefault();
    event.stopPropagation();

    obterDadosCP(JSON.parse(resposta));

});

// Ajustar função para alimentar dados gerais da ação
// talvez criar objeto carta, com propriedades: titulo, complemento, datas_texto, contratos: array, ...
function obterDadosCP(acao){
    const r = /(Com )(.*?)[.,]/i;
    const s = /Com ((Cia.?)?.+?)[,.]/ig;

    //var dados_cartas = [];
    var titulo = acao.nome;
    var datas = gerar_texto_datas(acao.datas);

    //  Criar rotina para verificar todos os contrato, loop em Array, propriedades nome: parcelas: total:
    var texto_parcelas = gerar_texto_contratos(acao)[0]; //obtem primeiro item de valores de contrato

    var total = texto_parcelas.total;
    var parcelas = texto_parcelas.parcelas;
    var contratado = texto_parcelas.nome;

    gerarDivCorrecoes(['titulo=' + titulo, 'contratado=' + contratado, 'datas=' + datas, 'total=' + total, 'parcelas=' + parcelas]);
}

// Ajustar função para lidar com listagem de objetos de contratos
// Usar estrutura do botão <button type="button" class="btn" data-toggle="dropdown">

function inserirBotao(){
    var d = $('#btn-export').parent();
    d.append('<button class="btn" id="btn-carta" role="button" data-toggle="modal">Carta Proposta</button>');
    $("#btn-carta").click(function(){
        //Alterar função para alimentar variáveis gerais da ação
        obterDadosCP(JSON.parse(resposta));
    });
}

function toReais(numero) {
    return numero.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
  }

// Retorna listagem de objetos
function gerar_texto_contratos(acao){

    var contratos = acao.servicos.filter(function(item){
        return item.itemDescricao.toLowerCase().includes("contrato") || item.itemDescricao.toLowerCase().includes("licença"); 
    });

    var texto = '';

    var retorno = [];

    contratos.forEach(contrato => {

        let n = 1;
        let texto_parcelas = '';
        let contratado = contrato.descricao == null ? 'Nulo' : contrato.descricao;

        if (contrato.parcelas != null){
        contrato.parcelas.forEach(parcela => {
            texto_parcelas += 'parcela ' + n + ', no valor de ' + toReais(parcela.valor) + ', a ser paga em ';
            texto_parcelas += parcela.dataPrevista + '; ';
            n++;
        })
        }else{
            texto_parcelas = "";
        }
        retorno.push({'contratado':contrato.descricao,'total':toReais(contrato.custo), 'parcelas': texto_parcelas});
    })

    return retorno
}

function gerar_texto_datas(datas){
    var texto = '';
    var ano = '';

    //Obtem dia e mês via regex
    const r_dia_mes = /0?(\d{1,2})\/0?(\d{1,2})\/20(\d{1,2})/i;
    const r_hora = /\d\d.\d\d$/i;
    const r_ano = /.*\/(\d\d)(\d\d).*/i;
    const r = /; $/; //identifica sobras de carater no final

    var z = {}; //guarda dados sobre datas para gerar texto

    datas.forEach(data => {
        
        //let ano = r_ano.exec(data.dataAgenda.dataInicio)[2];
        let mes = r_dia_mes.exec(data.dataAgenda.dataInicio)[2];
        let dia = r_dia_mes.exec(data.dataAgenda.dataInicio)[1];
        ano = r_dia_mes.exec(data.dataAgenda.dataInicio)[3]; // teste de var ano
        let hora_inicio = r_hora.exec(data.dataAgenda.dataInicio);
        let hora_fim = r_hora.exec(data.dataAgenda.dataFim);
        let horario = 'das ' + hora_inicio + ' às ' + hora_fim;

        if (z[horario] == null){
            z[horario] = {};
        }

        if (z[horario][mes] == null){
            z[horario][mes] = [];
        }

        z[horario][mes].push(dia);

    })

    for (let horario in z){
        for (let mes in z[horario]){
            //texto += z[horario][mes].join(', ') + '/' + mes + '/' + ano + ', ' ;
            texto += z[horario][mes].join(', ') + '/' + mes + ', ' ;
        }
        texto += horario + '; ';
    }

    //retira último ; da string de datas
    texto = texto.replace(r, '');

    //regez que identifica ultimo horário
    const x = /(, das .{1,22}$)/;
    texto = texto.replace(x, '/' + ano + '$1');

    return texto
}

//Insere DIV com dados obtidos para criar Carta Proposta
function gerarDivCorrecoes (dados_cp) {
    'use strict';    

    let textos_cp = dados_cp.join('|');

    // Inserir Dados da ação em input
    var n = document.getElementById("link-anexos");

    //cria parágrafo para armazenar dados da carta

    //Rotina para não inserir mais um div com infos
    if (document.getElementById("dados_carta") == null){
        var ativ = document.createElement("p");
        ativ.innerHTML = '<input type="text" value="' + textos_cp + '" id="dados_carta" style="border:0px;font-size:10px;margin-left:-.5em;">';
        var myInput = document.getElementById("dados_carta");
        //n.insertBefore(ativ, n.firstChild);
        n.appendChild(ativ);
    }else{
        ativ = document.getElementById('dados_carta');
        ativ.value = textos_cp;
    }

    //Função de copiar para ClipBoard
    ativ.addEventListener('click', function() {
        //Copy text from input field to clipboard
        var copyText = document.getElementById("dados_carta");
        copyText.select();
        document.execCommand("copy");
    }, false);


    ativ.click();
    document.activeElement.blur();
    window.open(template_link);
    ativ.remove();
}
