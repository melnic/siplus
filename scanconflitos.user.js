// ==UserScript==
// @name         Scan Conflitos Espaços
// @namespace    http://tampermonkey.net/
// @version      23.6.14
// @description  Verificar Conflitos
// @author       You
// @match        http://webapps.sorocaba.sescsp.org.br/siplan/*
// @grant        none
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      https://raw.githubusercontent.com/jeresig/jquery.hotkeys/master/jquery.hotkeys.js
// @grant       GM_addStyle
// ==/UserScript==

//Inserir Funções para acionar quando carregar itens

var resposta = '';

//waitForKeyElements (".fc-event", alert('Div de evento detectado'));

var open = XMLHttpRequest.prototype.open;
var acoes_div = $('');
var dados = [];

const intervaloMinimo = 60; //em minutos
var data = "09/05/2023 08:00";
var resultado = [];
var conflitos = [];
var acoes_local = [];
var locais_usados = [];
const css_conflitos = '.intervaloCurto { border-left: 3px solid #e6ff00 !important; margin-left:-3px !important} .conflito {border-left: 3px solid #ff2859 !important; margin-left:-3px !important}';

XMLHttpRequest.prototype.open = function(method, url, async) {
    //alert(url);
    if (url.indexOf('api/atividade?start=') !== -1) {
        this.addEventListener('load', function() {
            resposta = this.responseText;
            //alert('GET de datas identificado');

            scanConflitos(resposta);
        });
    }
    //
    open.apply(this, arguments);
};

// RETOMAR A PARTIR DAQUI

function scanConflitos(d){
    //alert('Scan Conflitos');
    dados = JSON.parse(d);

    //JSON.parse(resposta);  Transforma texto em objeto JSON
    acoes_div = $('.fc-event');
    //var
    const intervaloMinimo = 60; //em minutos
    var data = "09/05/2023 08:00";
    var resultado = [];
    var conflitos = [];
    var acoes_local = [];
    var locais_usados = [];

    //Inserir tabela de estilo para conflitos no DOM
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css_conflitos;
    document.getElementsByTagName('head')[0].appendChild(style);

    let e = filtrarDuplicatas(dados);  //Filtra dados duplicados no JSON recebido
    e.forEach(inserirElemento);        //Vincula divs ao Json com dados das ações, para posterior alteração de estilo

    scanAcoes(e); //verifica conflitos de data e horário
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
}

function scanAcoes(d){
  let locais_usados = []; //ver se melhor ser variável global
  d.forEach(function(entry){
    if (locais_usados.indexOf(entry.local) == -1){
      locais_usados.push(entry.local);
    }
	});

  	let acoes_local = []; //ver se global é melhor
	locais_usados.forEach(function(entry){
		//acoes_local = dados.filter(function(entry2){
        acoes_local = dados.filter(function(entry2){
			return entry2.local == entry;
		});
		scanDatas(acoes_local);
	});

  function scanDatas(place){
  	for (var i = 0; i < place.length; i++){
  		if (typeof place[i + 1] !== 'undefined'){
  			var acao = place[i];
  			for (var j = i + 1; j < place.length; j++){
  				var comparada = place[j];

				//Verificar se ações não tem mesmo ID
				if (acao.id != comparada.id){
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
                        //usar propriedade offsetWidth
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
                            //usar propriedade offsetWidth
                        };
                    }
				}
  			}
  		}
  	}
  }
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