// ==UserScript==
// @name         Scan Conflitos Espaços
// @namespace    http://tampermonkey.net/
// @version      23.12.17
// @description  Verificar Conflitos
// @author       You
// @match        http://webapps.sorocaba.sescsp.org.br/siplan/*
// @grant        none
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      https://raw.githubusercontent.com/jeresig/jquery.hotkeys/master/jquery.hotkeys.js
// @downloadURL https://github.com/melnic/siplus/raw/master/scanconflitos.user.js
// @updateURL   https://github.com/melnic/siplus/raw/master/scanconflitos.user.js
// @grant       GM_addStyle
// ==/UserScript==

//Próxima função Conflitos de Camarim
//GET Com demandas para Alimentação
// http://webapps.sorocaba.sescsp.org.br/siplan/api/atividade?start=03%2F07%2F2023&end=10%2F07%2F2023&lo=96000000000038&lo=96000000000039&lo=96000000000040&lo=96000000000041&lo=96000000000042&lo=96000000000043&lo=96000000000016&av=TODAS&servicos=ALIMENTACAO&_=1688601170817
// &av=TODAS&servicos=ALIMENTACAO&_=1688601170817
//GET Alimentação
const camarins_start = 'http://webapps.sorocaba.sescsp.org.br/siplan/api/atividade?';
//start=26%2F06%2F2023&end=03%2F07%2F2023&
const camarins = 'lo=96000000000038&lo=96000000000039&lo=96000000000040&lo=96000000000041&lo=96000000000042&lo=96000000000043&lo=96000000000016';
const camarins_end = '&av=TODAS&servicos=ALIMENTACAO';

//Inserir Funções para acionar quando carregar itens
var resposta = '';

var open = XMLHttpRequest.prototype.open;
var acoes_div = $('');
var dados = [];

const intervaloMinimo = 60; //Intervalo Mínimo entre ações, em minutos
var resultado = [];
var conflitos = [];
var acoes_local = [];
var locais_usados = [];
var haConflito = false;
//Estilos a serem aplicados nos eventos do calendário
const css_conflitos = '.intervaloCurto { border-left: 3px solid #e6ff00 !important; margin-left:-3px !important} .conflito {border-left: 3px solid #ff2859 !important; margin-left:-3px !important}';

//Monitora dados de ações que são recebidas
XMLHttpRequest.prototype.open = function(method, url, async) {
    if (url.indexOf('api/atividade?start=') !== -1) {
        this.addEventListener('load', function() {
            resposta = this.responseText;
            haConflito = false;

            scanConflitos(resposta);
            //alert(haConflito);
        });
    }
    //
    open.apply(this, arguments);
};

//Função para obter dados de Ações requisitando JSON
var getJSON = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
            //callback(null, xhr.response);
            alert('não foi possível obter JSON');
        } else {
            //callback(status, xhr.response);
            return xhr.response;
        }
    };
    xhr.send();
};

function scanConflitos(d){
    dados = JSON.parse(d);

    acoes_div = $('.fc-event');

    //Inserir tabela de estilo para conflitos no DOM
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css_conflitos;
    document.getElementsByTagName('head')[0].appendChild(style);

    let e = filtrarDuplicatas(dados);  //Filtra dados duplicados no JSON recebido
    e.forEach(inserirElemento);        //Vincula divs ao Json com dados das ações, para posterior alteração de estilo

    scanLocais(e); //verifica conflitos de data e horário

}

function filtrarDuplicatas(d){
	let remover_acoes = [];
	let e = d; //copia dos dados

	for (let i = 0; i < d.length; i++){
	    if (typeof d[i + 1] !== 'undefined'){
	        for (var j = i + 1; j < d.length; j++){
	            if (d[i].id == d[j].id){
	                remover_acoes.push(j);
	            }
	        }
	    }
	}

	for (let i = 0; i < remover_acoes.length; i++){
	    e.splice(remover_acoes[i] - i,1);
	}

	return e

}

function inserirElemento(item, index, arr){
    item['div'] = acoes_div[index];
    item['inicio'] = converterParaData(item.start);
    item['fim'] = converterParaData(item.end);

    //\[RS\]/.test(item.title) ? acoes_div[index].css({ 'opacity' : 0.3 }) : null;
    /\[RS\]/.test(item.title) ? $(acoes_div[index]).css({ 'opacity' : 0.3 }) : null;
}

function scanLocais(d){
 
  d.forEach(function(entry){
    
    //Cria listagem de locais usados para posterior filtro
    if (locais_usados.indexOf(entry.local) == -1){
      locais_usados.push(entry.local);
    }
	});

    //Filtra dados de ações apenas por local e verifica datas em conflito
	locais_usados.forEach(function(entry){
        acoes_local = dados.filter(function(entry2){
			return entry2.local == entry;
		});
		scanDatas(acoes_local);
	});
    return haConflito
}

function scanDatas(place){

    for (var i = 0; i < place.length; i++){
        if (typeof place[i + 1] !== 'undefined'){
            var acao = place[i];
            for (var j = i + 1; j < place.length; j++){
                var comparada = place[j];

              //Verificar se ações não tem mesmo ID
              if (acao.id != comparada.id){
                  //Offset para deslocar DIV da ação para esquerda, ligado a CSS
                  let z = acao.div.offsetWidth - 3;

                    let res = verificarConflito(acao, comparada);
                    if(res.conflito){
                        resultado.push([acao, comparada, 'conflito']);
                      //acao.div.Css
                      acao.div.classList.add("conflito");
                      //acao.div.style.width= z + 'px';
                      //alert(acao.div);
                      comparada.div.classList.add("conflito");
                      //comparada.div.style.width= z + 'px';
                      haConflito = true;
                    };
                  //if(res.intervaloCurto && !res.conflito){
                  if(!res.conflito){
                      if(res.intervaloCurto){
                          resultado.push([acao, comparada, 'intervaloCurto']);
                          //acao.div.Css
                          acao.div.classList.add("intervaloCurto");
                          //acao.div.style.width= z + 'px';
                          //alert(acao.div);
                          comparada.div.classList.add("intervaloCurto");
                          //comparada.div.style.width= z + 'px';
                          haConflito = true;
                      };
                  }
              }
            }
        }
    }
    return haConflito
}

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

function verificarConflito(data1, data2) {
  const inicio1 = data1.inicio;
  const fim1 = data1.fim;
  const inicio2 = data2.inicio;
  const fim2 = data2.fim;

  const diffMs = Math.abs(fim1 - inicio2);
  const diffHrs = diffMs / (1000 * 60 * intervaloMinimo); //Define hora como parêmetro

  if (inicio1 < fim2 && inicio2 < fim1) {
    return { conflito: true, intervaloCurto: diffHrs < 1 };
  }

  return { conflito: false, intervaloCurto: diffHrs < 1 };
}
