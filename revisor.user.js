// ==UserScript==
// @name         Verificador de Ação
// @namespace    http://tampermonkey.net/
// @version      23.12.19
// @description  Obtem dados para carta proposta e lança no clipboard
// @author       You
// @match        http://webapps.sorocaba.sescsp.org.br/siplan/*
// @grant        none
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require     https://raw.githubusercontent.com/jeresig/jquery.hotkeys/master/jquery.hotkeys.js
// @downloadURL https://github.com/melnic/siplus/raw/master/revisor.user.js
// @updateURL   https://github.com/melnic/siplus/raw/master/revisor.user.js
// @grant       GM_addStyle
// ==/UserScript==

//TAREFAS
// Verificar horário de camarim menor que de apresentação

var adress = window.location.href;
var patt = /96\d{12}/i;
var n_acao = patt.exec(adress);
var link_acao = "http://webapps.sorocaba.sescsp.org.br/siplan/api/atividade/" + n_acao;
var resposta = '';

//Insere div com infos quando elementos são gerados
waitForKeyElements("#programacao-navbar", gerarDivCorrecoes);

// Monitorar requisições JSON
// Filtrar solicitações com base na URL
// Endereço de calendário /siplan/api/atividade?start=08%2F05%2F2023&end=15%2F05%2F2023
// URL de ação /siplan/api/atividade/96000309122407?

var open = XMLHttpRequest.prototype.open;
//alert('função foi injetada');
XMLHttpRequest.prototype.open = function (method, url, async) {
    //alert(url);
    //if (url.indexOf('api/atividade/96') !== -1) {
    if ((method === 'GET' || method === 'POST' || method === 'PUT') && url.indexOf('api/atividade/96') !== -1) {
        //alert('Solicitação obtida:', method, url);

        // Adicionar observador de eventos para a resposta
        this.addEventListener('load', function () {
            //resposta = this.responseText;
            resposta = (JSON.parse(this.responseText));
        });
    }
    open.apply(this, arguments);
};

//Como utilizar a função getJSON: Funcional CTRL + I Busca dados da ação
$(document).bind('keydown', 'ctrl+m', function (event) {

    event.preventDefault();
    event.stopPropagation();

    obterDadosCP(JSON.parse(resposta));

});

function obterDadosCP(acao) {

    var titulo = acao.nome;
    var tags = acao.tags;
    tags == null ? alert("nulo") : alert(tags);
}

//Converte Texto do Json e Objeto Data para comparação
function converterParaData(data){
    let dateParts = data.split(" ");
    let date = dateParts[0].split("/");
    let time = dateParts[1].split(":");
    let year = parseInt(date[2]);
    let month = parseInt(date[1]) - 1;
    let day = parseInt(date[0]);
    let hour = parseInt(time[0]);
    let minute = parseInt(time[1]);
    return new Date(year, month, day, hour, minute);
}

function camarimOK(data, servico){
    
    let conversor = 1000 * 60 * 60;
    //let ddd = dados.datas[0];
    let data_acao = converterParaData(data.dataAgenda.dataInicio);
    let conflito = false;

    let data_servico = converterParaData(servico.dataSolicitacao.dataInicio);
    let diferenca = ((data_acao - data_servico)/conversor);
    //alert(diferenca);
    if( diferenca >= 2){
        conflito =  false;
        } else{
        conflito = true;
    }

    return !conflito
}
    




//Inserir novo div com mensagens em #module-container > div > div.row-fluid
function gerarDivCorrecoes() {
    var erros = [];

    //CHECKLIST
    //Melhorias:
    //Inserir auto correção (função);
    //definir scroll para ponto de erro >> document.getElementById("divFirst").scrollIntoView();
    //inserir categoria de erro: crítico ou melhoria
    // Estatístico está integrado?
    !resposta.hasIntegracaoEstatistico ?
        erros.push('Estatístico não integrado') : null;

    //Se PCG< definir Rastreabilidade
    if (resposta.elegivelPcg) {
        resposta.rastreabilidade == "SEM_RASTREABILIDADE" ?
            erros.push('PCG: Definir rastreabilidade') : null;
    }

    //Contato: verificar se tem e-mail
    let r_email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/;
    r_email.exec(resposta.contatoFornecedores) == null ?
        erros.push("Contato: sem e-mail") : null;

    //Contato: verificar se tem telefone
    let r_telefone = /(\(?\d{2}\)?\s)?(\d{4,5}(\-)?\d{4})/;
    r_telefone.exec(resposta.contatoFornecedores) == null ?
        erros.push('Contato: sem telefone') : null;

    //Foto anexada?
    resposta.fotos == null ?
        erros.push('Sem fotos') : null;

    //Possui alguma tag?
    resposta.tags == null ?
        erros.push('Sem tags') : null;

    //Recomendação Etária
    resposta.recomendacaoEtaria == null ?
        erros.push('Sem Classificação Indicativa') : null;

    //Derivações Gerais para Setores
    var sem_derivacao = {
        "alimentacao" : false,
        "servicos" : false,
        "infraestrutura" : false,
        "comunicacao" : false,
        "audiovisual" : false
    };
    

    var local = '';
    //Loop datas
    resposta.datas.forEach(data => {
        //guarda local principal da ação, retirada de cada data
        //local = data.local;

        //Loop derivações (serviços)
        data.servicos.forEach(servico => {
            //verifica se local de serviço é igual ao da data
            servico.local != data.local ? erros.push('Locais divergentes: ' + servico.areaNome + ': ' + servico.dataSolicitacao.dataInicio.replace(/\/\d\d\d\d/,"")) : null;

            //Verifica se é demanda por Camarim ou Coffee para Alimentação
            if(/Camarim|Coffee/.test(servico.itemDescricao)){
            //if(servico.areaNome == "Alimentação"){
                sem_derivacao.alimentacao = null;
                camarimOK(data, servico) ? erros.push('Caramim ok: horários antecipados') : erros.push("Camarim: verificar horários");
            } else{
                sem_derivacao.alimentacao = true;
                                
            }
            servico.areaNome == "Infraestrutura" ? sem_derivacao.infraestrutura = true : null;
            servico.areaNome == "Serviços Gerais" ? sem_derivacao.servicos = true : null;
            servico.areaNome == "Operação de Montagem" ? sem_derivacao.audiovisual = true : null;
        })

    })
    
    sem_derivacao.alimentacao == false ? erros.push('Alimentação: sem demandas') : null;
    sem_derivacao.servicos == false ? erros.push('Serviços: sem demandas') : null;
    sem_derivacao.infraestrutura == false ? erros.push('Infra: sem demandas') : null;
    sem_derivacao.comunicacao == false ? erros.push('Comunicação: sem demandas') : null;
    sem_derivacao.audiovisual == false ? erros.push('Audiovisual: sem demandas') : null;

    //Verificar horário de Camarim


    //-----------------------

    if (document.getElementById("box-revisao") == null) {
        //var z = $('#programacao-navbar');
        // z.toggle();

        // Seletor do Container
        let n = document.querySelector("#module-container > div > div.row-fluid > div.span3");
        if (document.getElementById("box-revisao") == null) {
            var revisao = document.createElement("div");
            revisao.id = "box-revisao";
            revisao.style = "padding: 1em";
            n.appendChild(revisao);

            var cont = document.getElementById('container');

            // create ul element and set the attributes.
            var ul = document.createElement('ul');
            ul.setAttribute('style', 'padding: 0; margin: 0;position:fixed;bottom:10px;');
            ul.setAttribute('id', 'theList');

            for (i = 0; i <= erros.length - 1; i++) {
                var li = document.createElement('li');     // create li element.
                li.innerHTML = erros[i];      // assigning text to li using array value.
                li.setAttribute('style', 'display: block;');    // remove the bullets.

                ul.appendChild(li);     // append li to ul.
            }
            revisao.appendChild(ul);       // add list to the container.
        }
    }

}
