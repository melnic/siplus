// ==UserScript==
// @name         Gerador de Carta Proposta
// @namespace    http://tampermonkey.net/
// @version      23.12.23
// @description  Obtem dados para carta proposta e lança no clipboard
// @author       You
// @match        http://webapps.sorocaba.sescsp.org.br/siplan/*
// @grant        none
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require     https://raw.githubusercontent.com/jeresig/jquery.hotkeys/master/jquery.hotkeys.js
// @grant       GM_addStyle
// ==/UserScript==


// MELHORIAS E FUNCIONALIDADES
// Insere parcelamento de valores
// 12/7 Retira dados de Licença de Exibição
// 18/7 Corrigido conversão de float para reais
// Corrige ano nas cartas a partir de 2024
// Corrigido nome de arquivo com macro
// 28/12 Trabalha com vários contratos
// CTRL-Q Abre quadro-resumo
// TAB retirar ações sem conflitos

//MELHORAR

// Inserir tratamento de Carta Proposta
// Itens: keep, remove, change
// campos para o Change: titulo_acao,formato,hifen,contratado,horarios,total,intro_parcelas,parcelas,quadro2_PF,quadro2_PJ,ecad,vinculo,sbat,drt,autoria_danca,seguro,art,quadro3_PF,quadro3_PJ,quadro_representante_PJ,formato2,titulo_vinculo
// já é enviado: titulo,contratado,datas,total,parcelas
// 

//-----------------------
//Variáries de controle para gerar dados para CP v3
const allDocuments = "ecad, vinculo, sbat, drt, autoria_danca, seguro, art".split(", ").map(item => item.trim());
const formato = {
    musica: {
        formato: "apresentação de música",
        keep:"ecad,vinculo",
        remove:""
    }
};
//===============================================================
// TESTE do HOVER de DERIVAÇÔES

 // Function to extract the date and time from the hovered element
 function extractDateTime(text) {
    // Ajuste na expressão regular para capturar horas com ou sem minutos
    const match = text.match(/(\d{2}\/\d{2}\/\d{4}), (\d{1,2}h\d{0,2})/);
    if (match) {
        const date = match[1]; // e.g., "23/02/2025"
        let time = match[2]; // e.g., "7h" ou "17h30"

        // Adiciona "00" se os minutos estiverem ausentes
        if (!time.includes('h')) {
            time = time.replace('h', ':00'); // Caso raro, mas seguro
        } else if (!time.match(/\d{2}$/)) {
            time = time.replace('h', ':00'); // Se não houver minutos, adiciona ":00"
        } else {
            time = time.replace('h', ':'); // Formato padrão, substitui "h" por ":"
        }

        return `${date} ${time}`; // e.g., "23/02/2025 07:00" ou "23/02/2025 17:30"
    }
    return null;
}

// Function to create a table from matching JSON data
function createTable(servicos) {
    if (servicos.length === 0) {
        return '<p>No matching data found.</p>';
    }

    // Create the table HTML
    let table = `
                <table>
                    <thead>
                        <tr>
                            <th>Area Name</th>
                            <th>Local</th>
                            <th>Data Início</th>
                            <th>A</th>
                            <th>Item</th>
                            <th>Descrição</th>
                            <th>Observação</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

    // Loop through each matching item
    servicos.forEach(item => {
        const quantidadeAnexos = item.arquivos ? item.arquivos.length : 0;
        table += `
                    <tr>
                        <td>${item.areaNome || ''}</td>
                        <td>${item.dataSolicitacao.localSessaoNome || ''}</td>
                        <td>${item.dataSolicitacao.dataInicio || ''}</td>
                        <td>${quantidadeAnexos || '-'}</td>
                        <td>${item.itemDescricao || ''}</td>
                        <td>${item.descricao || ''}</td>
                        <td>${item.observacao || ''}</td>
                    </tr>
                `;
    });

    table += `
                    </tbody>
                </table>
            `;

    return table;
}

        // Apply styles using JavaScript
function applyStyles() {
    // Style for hover elements
    // const hoverElements = document.querySelectorAll('.data-text');
    // hoverElements.forEach(element => {
    //     // element.style.display = 'inline-block';
    //     // element.style.padding = '10px';
    //     // element.style.backgroundColor = '#007bff';
    //     // element.style.color = 'white';
    //     // element.style.cursor = 'pointer';
    //     // element.style.margin = '10px 0';
    // });

    // // Style for floating div
    const floatingDiv = document.getElementById('floatingDiv');
    floatingDiv.style.display = 'none';
    floatingDiv.style.position = 'absolute';
    floatingDiv.style.backgroundColor = '#f9f9f9';
    // floatingDiv.style.border = '1px solid #ccc';
    floatingDiv.style.padding = '10px';
    floatingDiv.style.maxWidth = '1000px';
    floatingDiv.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    floatingDiv.style.zIndex = '1000';

    // // Style for table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // // Style for table headers and cells
    // const th = document.createElement('th');
    // th.style.padding = '8px';
    // th.style.border = '1px solid #ddd !Important';
    // th.style.textAlign = 'left';
    // th.style.backgroundColor = '#f2f2f2';

    // const td = document.createElement('td');
    // td.style.padding = '8px';
    // td.style.border = '1px solid #ddd';
    // td.style.textAlign = 'left';

    // Injectando CSS
    
    // Create a <style> element
    const styleElement = document.createElement('style');

    // Set the CSS content
    styleElement.textContent = `
        #floatingDiv th {
            text-align: left; !important
        }

        #floatingDiv th, td {
            padding-top: 0px;
            padding-bottom: 0px;
            padding-left: 0px;
            padding-right: 4px;
        }

        #floatingDiv tr:nth-child(odd) {
            background-color:rgb(237, 237, 237);
        }

        #floatingDiv td:nth-child(1) {
          width: 6em;          
        }

        #floatingDiv td:nth-child(2) {
          width: 5em;
          overflow:hidden;
          white-space:nowrap; 
        }        
        
        #floatingDiv td:nth-child(3) {
          width: 6em;          
        }

        #floatingDiv td:nth-child(4) {
          width: 1em;          
          color: red;
        }

        #floatingDiv td:nth-child(5) {
          width: 8em;          
        }

        #floatingDiv td:nth-child(6) {
          width: 8em;          
        }

        h1 {
            // color: darkblue;
            // font-size: 24px;
        }
    `;

    // Append the <style> element to the <head> of the document
    document.head.appendChild(styleElement);
}

function createHoverDiv(){
    // Check if the floatingDiv already exists
    let floatingDiv = document.getElementById('floatingDiv');

    // If it doesn't exist, create it and append it to the body
    if (!floatingDiv) {
        floatingDiv = document.createElement('div');
        floatingDiv.id = 'floatingDiv';
        document.body.appendChild(floatingDiv);
    }
    
}


function createHover(){
    //cria div para exibir tabela
    createHoverDiv();

    // Call the function to apply styles
    applyStyles();

    // Get all elements with the class "data-text"
    const hoverElements = document.querySelectorAll('.data-text');
    const floatingDiv = document.getElementById('floatingDiv');

    // Add event listeners for hover
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            // Extract the date and time from the hovered element
            const dateTime = extractDateTime(element.textContent);

            if (dateTime) {
                // Find matching data in the JSON
                const matchingData = resposta.datas.find( // <<<<<<<<<<<<<<<< Editar para injectar corretamente objeto JSON
                    item => item.dataAgenda.dataInicio === dateTime
                );

                if (matchingData) {
                    // Display the floating div with matching data
                    floatingDiv.style.display = 'block';
                    floatingDiv.innerHTML = createTable(matchingData.servicos);

                    // Position the floating div near the hovered element
                    const rect = element.getBoundingClientRect();
                    floatingDiv.style.top = `${rect.bottom + window.scrollY}px`;
                    floatingDiv.style.left = `${rect.left + window.scrollX - 100}px`;
                } else {
                    floatingDiv.style.display = 'block';
                    floatingDiv.innerHTML = '<p>No matching data found.</p>';
                }
            }
        });

        element.addEventListener('mouseleave', () => {
            // Hide the floating div
            floatingDiv.style.display = 'none';
        });
    });
}

//===================================================

//inserirBotaoCPs(gerarDadosDeContratos(JSON.parse(resposta)));
waitForKeyElements("#btn-export", inserirBotao);

//Espera surgir Botão Cancelar para inserir 
waitForKeyElements("#datas-list-container", createHover);

    // // CALL HOVER FUNCTION
    // createHover(); //apagar se bugar;

var adress = window.location.href;
var patt = /96\d{12}/i;
var n_acao = patt.exec(adress);
var link_acao = "http://webapps.sorocaba.sescsp.org.br/siplan/api/atividade/" + n_acao;
var resposta = {};
//Office URI Schemes
const template_link = "ms-word:nft|u|https://sescsp.sharepoint.com/sites/NcleoArtstico-SescSorocaba/Shared%20Documents/Adm%20Programa%C3%A7%C3%A3o/Cartas%20Proposta/CP%20-%20Universal.dotm";

// Monitorar requisições JSON
// Filtrar solicitações com base na URL
// Endereço de calendário /siplan/api/atividade?start=08%2F05%2F2023&end=15%2F05%2F2023
// URL de ação /siplan/api/atividade/96000309122407?

var open = XMLHttpRequest.prototype.open;
//alert('função foi injetada');
XMLHttpRequest.prototype.open = function (method, url, async) {
    //alert(url);
    if (url.indexOf('api/atividade/96') !== -1) {
        //alert('Solicitação obtida:', method, url);

        // Adicionar observador de eventos para a resposta
        this.addEventListener('load', function () {
            resposta = JSON.parse(this.responseText);
        });
    }

    // Dados de Reload de Datas api//data-agenda/atividade/96000354543016
    // Retorna Arra com datas de derivações aka servicos

    //

    open.apply(this, arguments);
};

//Função para obter dados de Ações
var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

//Short-Cuts
//Abre quadro-resumo
$(document).bind('keydown', 'ctrl+q', function(){
    document.querySelector("#btn-quadro-resumo").click();
});

$(document).bind('keydown', 'ctrl+.', function(){
    document.querySelector('.container-date-next').click();
});

$(document).bind('keydown', 'ctrl+/', function(){
    createHover(); //apagar se bugar;
});



//Insere botão no caso de multiplos contratos na ação
//Formato
// menuItems = [
//     { id: "btn-exclusao", text: "Excluir" },
//     { id: "btn-quadro-resumo", text: "Quadro resumo" },
// ]:
function inserirBotaoCPs(dados) {

    // Create a new div element with class "btn-group"
    var btnGroupDiv = document.createElement("div");
    btnGroupDiv.className = "btn-group";

    // Create a button element with the specified properties
    var buttonElement = document.createElement("button");
    buttonElement.type = "button";
    buttonElement.className = "btn";
    buttonElement.setAttribute("data-toggle", "dropdown");
    buttonElement.innerText = "Cartas Proposta ";

    // Create a span element with class "caret"
    var caretSpan = document.createElement("span");
    caretSpan.className = "caret";

    // Append the span element to the button
    buttonElement.appendChild(caretSpan);

    // Append the button element to the div
    btnGroupDiv.appendChild(buttonElement);

    // Create a ul element with class "dropdown-menu" and role "menu"
    var ulElement = document.createElement("ul");
    ulElement.className = "dropdown-menu";
    ulElement.setAttribute("role", "menu");

    var menuItems = dados == null ?
        menuItems = [
            { id: "btn-exclusao", text: "Excluir" },
            { id: "btn-quadro-resumo", text: "Quadro resumo" },
        ] :
        menuItems = dados;
    ;

    // Iterate through the menu items and create li and a elements
    menuItems.forEach(function (item) {
        var liElement = document.createElement("li");
        var aElement = document.createElement("a");
        aElement.className = "pointer";
        aElement.id = item[0].numero;
        aElement.innerText = item[0].contratado;

        if (item.href) {
            aElement.href = item[0].href;
        }

        aElement.addEventListener("click", function () {
            // Call a specific function when the element is clicked
            copiarParaClipBoard(item[0].clipboard);
        });

        liElement.appendChild(aElement);
        ulElement.appendChild(liElement);
    });

    // Append the ul element to the div
    btnGroupDiv.appendChild(ulElement);

    // Append the div to the body or any other container element
    //document.body.appendChild(btnGroupDiv);
    document.querySelector('#btn-export').parentElement.appendChild(btnGroupDiv);
}

//Caso seja um contrato apenas
function inserirBotao() {

    //inserirBotaoCPs(gerarDadosDeContratos(JSON.parse(resposta)));
    inserirBotaoCPs(gerarDadosDeContratos(resposta));

}

// Ajustar função para alimentar dados gerais da ação
// talvez criar objeto carta, com propriedades: titulo, complemento, datas_texto, contratos: array, ...
function gerarDadosDeContratos(acao) {
    const r = /(Com )(.*?)[.,]/i;
    const s = /Com ((Cia.?)?.+?)[,.]/ig;

    //var dados_cartas = [];
    var titulo = acao.nome;
    var datas = gerar_texto_datas(acao.datas);
    var total = "";
    var parcelas = "";
    var contratado = "";
    var contratos = [];

    //Gerar listagem com dados de contratos
    var texto_parcelas = gerarTextosDosContratos(acao);

    // Menu com Vários Contratos
    if (texto_parcelas.length >= 1) {

        //Para vários contratos
        // total = texto_parcelas[0].total;
        // parcelas = texto_parcelas[0].parcelas;
        // contratado = texto_parcelas[0].contratado;
        texto_parcelas.forEach((item, index) => {
            total = item.total;
            parcelas = item.parcelas;
            contratado = item.contratado;

            let infos = ['titulo=' + titulo, 'contratado=' + contratado, 'datas=' + datas, 'total=' + total, 'parcelas=' + parcelas];
            //texto com dados a serem passados para o ClipBoard de uma ação
            let texto = infos.join('|');
            contratos.push([{
                'numero': 'carta' + index,
                'contratado': contratado,
                'clipboard': texto,
            }])
        });


    } else {
        //Para 1 Contrato
        total = texto_parcelas[0].total;
        parcelas = texto_parcelas[0].parcelas;
        contratado = texto_parcelas[0].contratado;

        let infos = ['titulo=' + titulo, 'contratado=' + contratado, 'datas=' + datas, 'total=' + total, 'parcelas=' + parcelas];
        //texto com dados a serem passados para o ClipBoard de uma ação
        let texto = infos.join('|');
        contratos.push([{
            'numero': carta1,
            'contratado': contratado,
            'clipboard': texto,
        }])
    }
    return contratos
    //Cria Div com dados de um contrato
    //copiarParaClipBoard(['titulo=' + titulo, 'contratado=' + contratado, 'datas=' + datas, 'total=' + total, 'parcelas=' + parcelas]);
}

function toReais(numero) {
    return numero.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

// Retorna listagem de objetos com dados de contratos
function gerarTextosDosContratos(acao) {

    var texto = '';
    var retorno = [];

    //Filtra ações com item contrato
    var contratos = acao.servicos.filter(function (item) {
        return item.itemDescricao.toLowerCase().includes("contrato") || item.itemDescricao.toLowerCase().includes("licença");
    });

    contratos.forEach(contrato => {

        let n = 1;
        let texto_parcelas = '';
        let contratado = contrato.descricao ? contrato.descricao : 'Preencher';

        if (contrato.parcelas != null) {
            contrato.parcelas.forEach(parcela => {
                texto_parcelas += 'parcela ' + n + ', no valor de ' + toReais(parcela.valor) + ', a ser paga em ';
                texto_parcelas += parcela.dataPrevista + '; ';
                n++;
            })
        } else {
            texto_parcelas = "";
        }
        //retorno.push({'contratado':contrato.descricao,'total':toReais(contrato.custo), 'parcelas': texto_parcelas});
        retorno.push({
            'contratado': contratado,
            'total': toReais(contrato.custo),
            'parcelas': texto_parcelas
        });
    })

    return retorno
}

function gerar_texto_datas(datas) {
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

        if (z[horario] == null) {
            z[horario] = {};
        }

        if (z[horario][mes] == null) {
            z[horario][mes] = [];
        }

        z[horario][mes].push(dia);

    })

    for (let horario in z) {
        for (let mes in z[horario]) {
            //texto += z[horario][mes].join(', ') + '/' + mes + '/' + ano + ', ' ;
            texto += z[horario][mes].join(', ') + '/' + mes + ', ';
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
function copiarParaClipBoard(dados_cp) {
    'use strict';

    //Gerar String para o ClipBoard
    let textos_cp = dados_cp;

    // Inserir Dados da ação em input
    var n = document.getElementById("link-anexos");

    //Rotina para não inserir mais um div com infos
    if (document.getElementById("dados_carta") == null) {
        var ativ = document.createElement("p");
        ativ.innerHTML = '<input type="text" value="' + textos_cp + '" id="dados_carta" style="border:0px;font-size:10px;margin-left:-.5em;">';
        var myInput = document.getElementById("dados_carta");
        //n.insertBefore(ativ, n.firstChild);
        n.appendChild(ativ);
    } else {
        ativ = document.getElementById('dados_carta');
        ativ.value = textos_cp;
    }

    //Função de copiar para ClipBoard
    ativ.addEventListener('click', function () {
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
