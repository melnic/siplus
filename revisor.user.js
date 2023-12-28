// ==UserScript==
// @name         Verificador de Ação
// @namespace    http://tampermonkey.net/
// @version      23.12.28
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


// MELHORIAS
// Oculta menu de navegação ao clicar na lista de mensagens
// Verifica se horário de camarim está antecipado
// Se estatístico está integrado
// Se tem PCG e rastreabilidade
// Se contato possui e-mail e telefone
// Se possui fotos anexadas
// Se incluiu tags
// Se tem recomendação etária
// Se tem derivação para cada e todos os setores
// Se derivações estão consistentes com o local da ação, ignorando pedidos de Camarime Coffee

var adress = window.location.href;
var patt = /96\d{12}/i;
var n_acao = patt.exec(adress);
var link_acao = "http://webapps.sorocaba.sescsp.org.br/siplan/api/atividade/" + n_acao;
var resposta = '';
var w = waitForKeyElements;
var quadroResumo = false;
//Insere div com infos quando elementos são gerados
waitForKeyElements("#programacao-navbar", verificarAcao);

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

$(document).keyup(function(e) {
    if (e.key === "Escape") { // escape key maps to keycode `27`
       $('#quadro-resumo-modal > div > div.modal-header > button').click();
   }
});

waitForKeyElements(".modal-backdrop", (element) => {
    element.on( "click", function() {
       $('#quadro-resumo-modal > div > div.modal-header > button').click();
    });
});

function obterDadosCP(acao) {

    var titulo = acao.nome;
    var tags = acao.tags;
    tags == null ? alert("nulo") : alert(tags);
}

//Converte Texto do Json e Objeto Data para comparação
function converterParaData(data) {
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

function camarimAntecipado(data, servico) {

    let conversor = 1000 * 60 * 60;
    //let ddd = dados.datas[0];
    let data_acao = converterParaData(data.dataAgenda.dataInicio);
    let conflito = false;

    let data_servico = converterParaData(servico.dataSolicitacao.dataInicio);
    let diferenca = ((data_acao - data_servico) / conversor);
    //alert(diferenca);
    if (diferenca >= 2) {
        conflito = false;
    } else {
        conflito = true;
    }

    return !conflito
}

//Inserir novo div com mensagens em #module-container > div > div.row-fluid
function verificarAcao() {
    var mensagens = [];

    //CHECKLIST
    //Melhorias:
    //Inserir auto correção (função);
    //definir scroll para ponto de erro >> document.getElementById("divFirst").scrollIntoView();
    //inserir categoria de erro: crítico ou melhoria
    // Estatístico está integrado?
    !resposta.hasIntegracaoEstatistico ?
        mensagens.push('Estatístico não integrado') : null;

    //Se PCG< definir Rastreabilidade
    if (resposta.elegivelPcg) {
        resposta.rastreabilidade == "SEM_RASTREABILIDADE" ?
            mensagens.push('PCG: Definir rastreabilidade') : null;
    }

    //Contato: verificar se tem e-mail
    let r_email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/;
    r_email.exec(resposta.contatoFornecedores) == null ?
        mensagens.push("Contato: sem e-mail") : null;

    //Contato: verificar se tem telefone
    let r_telefone = /(\(?\d{2}\)?\s)?(\d{4,5}[\- ]?\d{4})/;
    r_telefone.exec(resposta.contatoFornecedores) == null ?
        mensagens.push('Contato: sem telefone') : null;

    //Foto anexada?
    resposta.fotos == null ?
        mensagens.push('Sem fotos') : null;

    //Possui alguma tag?
    resposta.tags == null ?
        mensagens.push('Sem tags') : null;

    //Recomendação Etária
    resposta.recomendacaoEtaria == null ?
        mensagens.push('Sem Classificação Indicativa') : null;

    //Derivações Gerais para Setores
    var sem_derivacao = {
        "alimentacao": false,
        "servicos": false,
        "infraestrutura": false,
        "comunicacao": false,
        "audiovisual": false
    };

    var local = '';
    //Loop datas
    resposta.datas.forEach(data => {
        //guarda local principal da ação, retirada de cada data

        //Loop derivações (serviços)
        data.servicos.forEach(servico => {

            //verifica se local de serviço é igual ao da data
            if (servico.local != data.local) {
                if (servico.areaNome != "Alimentação") {
                    sem_derivacao.alimentacao = true;
                    mensagens.push('Locais divergentes: ' + servico.areaNome + ': ' + servico.dataSolicitacao.dataInicio.replace(/\/\d\d\d\d/, ""));
                } else {
                    //Se for demanda de Alimentação >>>
                    sem_derivacao.alimentacao = null;
                    //teste de horário antecipado de camarim
                    camarimAntecipado(data, servico) ? null : mensagens.push("Camarim: verificar antecipação");

                    //Se item dor camarim, ignora incorência em espaços
                    /Camarim|Coffee|Reserva/.test(servico.itemDescricao) ?
                        null :
                        mensagens.push('Locais divergentes: ' + servico.areaNome + ': ' + servico.dataSolicitacao.dataInicio.replace(/\/\d\d\d\d/, ""));
                }
            }

            //Verifica se Operações de Montagem tem texto ou anexo
            if (servico.areaNome == "Operação de Montagem") {
                let sem_anexos = true;
                let sem_textos = true;
                servico.arquivos ? sem_anexos = false : sem_anexos = true;
                servico.observacao ? sem_textos = false : sem_textos = true;
                servico.descricao ? sem_textos = false : sem_textos = true;

                sem_anexos && sem_textos ? mensagens.push('Op. Montagem sem orientações (anexo ou texto') : null;
                //sem_textos ? mensagens.push('Op. Montagem sem completo ou observações') : null;

            }
            //Imprime horários dos camarins
            // /Camarim|Coffee/.test(servico.itemDescricao)
            //     ? erros.push(servico.itemDescricao + '> ' + servico.local + ': ' + servico.dataSolicitacao.dataInicio.replace(/\/\d\d\d\d/,""))
            //     : null;

            //Verifica ausências de inserções
            servico.areaNome == "Infraestrutura" ? sem_derivacao.infraestrutura = true : null;
            servico.areaNome == "Serviços Gerais" ? sem_derivacao.servicos = true : null;
            servico.areaNome == "Operação de Montagem" ? sem_derivacao.audiovisual = true : null;
        })

    })

    sem_derivacao.alimentacao == false ? mensagens.push('Alimentação: sem demandas') : null;
    sem_derivacao.servicos == false ? mensagens.push('Serviços: sem demandas') : null;
    sem_derivacao.infraestrutura == false ? mensagens.push('Infra: sem demandas') : null;
    sem_derivacao.comunicacao == false ? mensagens.push('Comunicação: sem demandas') : null;
    sem_derivacao.audiovisual == false ? mensagens.push('Audiovisual: sem demandas') : null;

    //Criar Div com mensagens
    if (document.getElementById("box-revisao") == null) {

        // Seletor do Container
        let n = document.querySelector("#module-container > div > div.row-fluid > div.span3");
        if (document.getElementById("box-revisao") == null) {
            var revisao = document.createElement("div");
            var menu = document.querySelector("#programacao-navbar");
            menu.style.visibility = 'visible';

            revisao.id = "box-revisao";
            revisao.style = "padding: 1em";
            n.appendChild(revisao);

            var cont = document.getElementById('container');

            // create ul element and set the attributes.
            var ul = document.createElement('ul');
            ul.setAttribute('style', 'padding: 0; margin: 0;position:fixed;bottom:10px;');
            ul.setAttribute('id', 'theList');            

            for (i = 0; i <= mensagens.length - 1; i++) {
                let li = document.createElement('li');     // create li element.
                li.innerHTML = mensagens[i];      // assigning text to li using array value.
                li.setAttribute('style', 'display: block;');    // remove the bullets.

                ul.appendChild(li);     // append li to ul.
            }

            // //Rotina para criar botão de ocultar
            // var btnOcultar = document.createElement('li');     // create li element.
            // btnOcultar.innerHTML = "Ocultar menu";      // assigning text to li using array value.
            // btnOcultar.setAttribute('style', 'display: block; background-color:#ffcfcf; color:#995d5d');    // remove the bullets.
            // ul.appendChild(btnOcultar);     // append li to ul.   

            //btnOcultar.addEventListener("click", function () {                
            ul.addEventListener("click", function () {
                if (menu.style.visibility == 'visible') {
                    menu.style.visibility = 'hidden';
                } else {
                    menu.style.visibility = 'visible';
                }
            });

            revisao.appendChild(ul);       // add list to the container.
        }
    }

}
