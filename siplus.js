//CSS Style
var css = document.createElement("style");
css.type = "text/css";
css.innerHTML = "* {font-family: sans-serif;} .siplus-listagem{background-color:#DDD;float:left;padding:10px} .siplus-listagem li{margin-bottom:10px} #listagem-resultados li {list-style:decimal} .conflito {background-color:rgba(255,0,0,.2);padding:5px;}";
document.body.appendChild(css);

var endereco_acao = ["http://webapps.sorocaba.sescsp.org.br/siplan/?atividade/","#!/atividade/"];
var a = ["<a  target='_blank' rel='noopener noreferrer'  href='","'>","</a>"];

var toHours = 1000 * 60 * 60; // Conversão de milisegundos para horas
var datas = [ //VAriavel para testes
  {
    "start":"03/03/2020 14:30",
		"end": "03/03/2020 18:00"
	},
	{
		"start": "03/03/2020 11:30",
		"end": "03/03/2020 16:00"
	},
	{
		"start": "03/03/2020 16:30",
		"end": "03/03/2020 17:00"
	},
	{
		"start": "03/03/2020 10:30",
		"end": "03/03/2020 12:00"
	},
	{
		"start": "03/03/2020 19:30",
		"end": "03/03/2020 21:00"
	}
];
//Variável Teste acoes
var acoes_agenda = [
  {
    "id": 96000081279781,
    "atividadeId": 96000081279743,
    "estimativaPublico": 32,
    "title": "[AP] [PER] [SGC] JUVENTUDES - TAH LIGADO",
    "complemento": "Terca 14h30 | Quinta 14h30 - De 13 a 20 anos",
    "start": "03/03/2020 14:30",
    "end": "03/03/2020 18:00",
    "isSessao": true,
    "allDay": false,
    "hasAvaliacao": false,
    "corLocal": "#00BFFF",
    "corLinguagem": "#8EE5EE",
    "foto": null,
    "status": "APROVADO",
    "linguagem": "Jovens",
    "local": "Oficinas",
    "formato": "curso",
    "tecnico": "Sistema Gestor de Cursos",
    "tecnicoId": 52894,
    "plantonistaId": null,
    "tipo": "atividade",
    "projetoId": null,
    "intencaoId": null,
    "corProjeto": null,
    "projeto": null,
    "sinopse": null,
    "setor": "PROGRAMAÇÃO ",
    "retiradaIngresso": null,
    "tipoPrecificacao": "INSCRICAO",
    "precificacoes": null,
    "datas": null,
    "hasIntegracaoCursos": true,
    "statusLancamento": "APROVADO",
    "isIntegradaCursos": true
  },
  {
    "id": 96000081279781,
    "atividadeId": 96000081279743,
    "estimativaPublico": 32,
    "title": "[AP] [PER] [SGC] JUVENTUDES - TAH LIGADO",
    "complemento": "Terca 14h30 | Quinta 14h30 - De 13 a 20 anos",
    "start": "03/03/2020 14:30",
    "end": "03/03/2020 18:00",
    "isSessao": true,
    "allDay": false,
    "hasAvaliacao": false,
    "corLocal": "#00BFFF",
    "corLinguagem": "#8EE5EE",
    "foto": null,
    "status": "APROVADO",
    "linguagem": "Jovens",
    "local": "Oficinas",
    "formato": "curso",
    "tecnico": "Sistema Gestor de Cursos",
    "tecnicoId": 52894,
    "plantonistaId": null,
    "tipo": "atividade",
    "projetoId": null,
    "intencaoId": null,
    "corProjeto": null,
    "projeto": null,
    "sinopse": null,
    "setor": "PROGRAMAÇÃO ",
    "retiradaIngresso": null,
    "tipoPrecificacao": "INSCRICAO",
    "precificacoes": null,
    "datas": null,
    "hasIntegracaoCursos": true,
    "statusLancamento": "APROVADO",
    "isIntegradaCursos": true
  },
  {
    "id": 96000081278945,
    "atividadeId": 96000081278869,
    "estimativaPublico": 76,
    "title": "[AP] [PER] [SGC] Curumim",
    "complemento": "Terca 08h | Quarta 08h | Quinta 08h | Sexta 08h - De 7 a 12 anos",
    "start": "04/03/2020 08:00",
    "end": "04/03/2020 11:30",
    "isSessao": true,
    "allDay": false,
    "hasAvaliacao": false,
    "corLocal": "#00BFFF",
    "corLinguagem": "#00F5FF",
    "foto": null,
    "status": "APROVADO",
    "linguagem": "Crianças",
    "local": "Oficinas",
    "formato": "curso",
    "tecnico": "Sistema Gestor de Cursos",
    "tecnicoId": 52894,
    "plantonistaId": null,
    "tipo": "atividade",
    "projetoId": null,
    "intencaoId": null,
    "corProjeto": null,
    "projeto": null,
    "sinopse": null,
    "setor": "PROGRAMAÇÃO ",
    "retiradaIngresso": null,
    "tipoPrecificacao": "INSCRICAO",
    "precificacoes": null,
    "datas": null,
    "hasIntegracaoCursos": true,
    "statusLancamento": "APROVADO",
    "isIntegradaCursos": true
  },
  {
    "id": 96000081278945,
    "atividadeId": 96000081278869,
    "estimativaPublico": 76,
    "title": "[AP] [PER] [SGC] Curumim",
    "complemento": "Terca 08h | Quarta 08h | Quinta 08h | Sexta 08h - De 7 a 12 anos",
    "start": "03/03/2020 08:00",
    "end": "03/03/2020 14:00",
    "isSessao": true,
    "allDay": false,
    "hasAvaliacao": false,
    "corLocal": "#00BFFF",
    "corLinguagem": "#00F5FF",
    "foto": null,
    "status": "APROVADO",
    "linguagem": "Crianças",
    "local": "Oficinas",
    "formato": "curso",
    "tecnico": "Sistema Gestor de Cursos",
    "tecnicoId": 52894,
    "plantonistaId": null,
    "tipo": "atividade",
    "projetoId": null,
    "intencaoId": null,
    "corProjeto": null,
    "projeto": null,
    "sinopse": null,
    "setor": "PROGRAMAÇÃO ",
    "retiradaIngresso": null,
    "tipoPrecificacao": "INSCRICAO",
    "precificacoes": null,
    "datas": null,
    "hasIntegracaoCursos": true,
    "statusLancamento": "APROVADO",
    "isIntegradaCursos": true
  }
  ];

var acao_dados = {
  "id":96000077783571,"status":"CANCELADO","statusAnterior":"APROVADO","nome":"[CANCELADO] Richard Ferrarini e Grupo","complemento":"Reminiscênias","sinopseSimples":null,"datas":[{"dataAgenda":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":"AGENDADO","statusLancamentoAnterior":null},"local":96000000000010,"servicos":[{"id":96000087440123,"tmpId":null,"servicoPai":null,"servicoPaiArea":"Programação","template":"COMUNICACAO","item":96000000014811,"area":3,"areaNome":"Comunicação","itemDescricao":"Publicação nas Redes Sociais (EW)","descricao":"Ações Online","observacao":"Para todas as apresentações do projeto.","notificacao":null,"observacaoChecklist":null,"observacaoArea":null,"possuiCusto":false,"custo":0.0,"valorPedido":0.0,"arquivos":null,"agrupamento":96000087440124,"agrupamentoMultiplo":false,"tecnicoId":null,"tecnicoNome":null,"acao":null,"local":null,"dataSolicitacao":null,"numeroPessoas":null,"status":null,"statusSolicitacao":"PENDENTE","quantidade":null,"prazoArte":null,"prazoFinal":null,"indicacoes":null,"justificativa":null,"finalizadoEm":null,"alterado":false,"parcelas":[],"dataPrevistaPagamento":null,"responsaveis":[],"ultimaSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"primeiraSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"dataPrevistaSessao":null},{"id":96000083383261,"tmpId":null,"servicoPai":null,"servicoPaiArea":"Programação","template":"ALIMENTACAO","item":96000000000200,"area":2,"areaNome":"Alimentação","itemDescricao":"Água em garrafa retornável - Sessão [3007-4]","descricao":null,"observacao":null,"notificacao":null,"observacaoChecklist":null,"observacaoArea":null,"possuiCusto":true,"custo":1.7,"valorPedido":0.0,"arquivos":null,"agrupamento":96000083383260,"agrupamentoMultiplo":false,"tecnicoId":null,"tecnicoNome":null,"acao":null,"local":96000000000010,"dataSolicitacao":{"id":96000083383262,"dataInicio":"05/04/2020 16:30","dataFim":"05/04/2020 19:00","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":"Convivência","localSessaoId":"96000000000010","statusLancamento":null,"statusLancamentoAnterior":null},"numeroPessoas":7,"status":null,"statusSolicitacao":"PENDENTE","quantidade":null,"prazoArte":null,"prazoFinal":null,"indicacoes":null,"justificativa":null,"finalizadoEm":null,"alterado":false,"parcelas":[],"dataPrevistaPagamento":"05/04/2020","responsaveis":[],"ultimaSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"primeiraSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"dataPrevistaSessao":true},{"id":96000087440155,"tmpId":null,"servicoPai":null,"servicoPaiArea":"Programação","template":"COMUNICACAO","item":96000000014804,"area":3,"areaNome":"Comunicação","itemDescricao":"Produção de Release (AI)","descricao":"Release imprensa","observacao":"Da programação completa","notificacao":null,"observacaoChecklist":null,"observacaoArea":null,"possuiCusto":false,"custo":0.0,"valorPedido":0.0,"arquivos":null,"agrupamento":96000087440156,"agrupamentoMultiplo":false,"tecnicoId":null,"tecnicoNome":null,"acao":null,"local":null,"dataSolicitacao":null,"numeroPessoas":null,"status":null,"statusSolicitacao":"PENDENTE","quantidade":null,"prazoArte":null,"prazoFinal":null,"indicacoes":null,"justificativa":null,"finalizadoEm":null,"alterado":false,"parcelas":[],"dataPrevistaPagamento":null,"responsaveis":[],"ultimaSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"primeiraSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"dataPrevistaSessao":null},{"id":96000087439307,"tmpId":null,"servicoPai":null,"servicoPaiArea":"Programação","template":"COMUNICACAO","item":96000000014797,"area":3,"areaNome":"Comunicação","itemDescricao":"Cobertura Fotográfica Interna (EW)","descricao":"Cobertura audiovisual interna","observacao":"Registro audiovisual de todas as apresentações do projeto.","notificacao":null,"observacaoChecklist":null,"observacaoArea":null,"possuiCusto":false,"custo":0.0,"valorPedido":0.0,"arquivos":null,"agrupamento":96000087439308,"agrupamentoMultiplo":false,"tecnicoId":null,"tecnicoNome":null,"acao":null,"local":null,"dataSolicitacao":null,"numeroPessoas":null,"status":null,"statusSolicitacao":"PENDENTE","quantidade":null,"prazoArte":null,"prazoFinal":null,"indicacoes":null,"justificativa":null,"finalizadoEm":null,"alterado":false,"parcelas":[],"dataPrevistaPagamento":null,"responsaveis":[],"ultimaSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"primeiraSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"dataPrevistaSessao":null},{"id":96000078244733,"tmpId":null,"servicoPai":null,"servicoPaiArea":"Programação","template":"ALIMENTACAO","item":96000000000202,"area":2,"areaNome":"Alimentação","itemDescricao":"Camarim Tipo 2 - Sessão [3007-4]","descricao":null,"observacao":"- Informe se há restrição alimentar","notificacao":null,"observacaoChecklist":null,"observacaoArea":null,"possuiCusto":true,"custo":32.0,"valorPedido":0.0,"arquivos":null,"agrupamento":96000078244732,"agrupamentoMultiplo":false,"tecnicoId":18045,"tecnicoNome":"MARIA EUGENIA L NAVARRO","acao":null,"local":96000000000038,"dataSolicitacao":{"id":96000078244734,"dataInicio":"05/04/2020 14:00","dataFim":"05/04/2020 19:00","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":"Camarim 1","localSessaoId":"96000000000038","statusLancamento":null,"statusLancamentoAnterior":null},"numeroPessoas":7,"status":null,"statusSolicitacao":"VISTO","quantidade":null,"prazoArte":null,"prazoFinal":null,"indicacoes":null,"justificativa":null,"finalizadoEm":null,"alterado":false,"parcelas":[],"dataPrevistaPagamento":"05/04/2020","responsaveis":[],"ultimaSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"primeiraSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"dataPrevistaSessao":true},{"id":96000078244773,"tmpId":null,"servicoPai":null,"servicoPaiArea":"Programação","template":"INFRAESTRUTURA","item":96000000000053,"area":4,"areaNome":"Infraestrutura","itemDescricao":"Acompanhamento - Sessão","descricao":null,"observacao":null,"notificacao":null,"observacaoChecklist":null,"observacaoArea":null,"possuiCusto":false,"custo":null,"valorPedido":null,"arquivos":null,"agrupamento":96000078244772,"agrupamentoMultiplo":false,"tecnicoId":14231,"tecnicoNome":"CRISTIAN SALDANHA DIEGOLI","acao":null,"local":96000000000010,"dataSolicitacao":{"id":96000078244774,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":"Convivência","localSessaoId":"96000000000010","statusLancamento":null,"statusLancamentoAnterior":null},"numeroPessoas":null,"status":null,"statusSolicitacao":"VISTO","quantidade":null,"prazoArte":null,"prazoFinal":null,"indicacoes":null,"justificativa":null,"finalizadoEm":null,"alterado":false,"parcelas":[],"dataPrevistaPagamento":null,"responsaveis":[],"ultimaSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"primeiraSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"dataPrevistaSessao":null},{"id":96000078244768,"tmpId":null,"servicoPai":null,"servicoPaiArea":"Programação","template":"MONTAGEM","item":96000069576087,"area":7,"areaNome":"Operação de Montagem","itemDescricao":"Audio e Luz - Montagens","descricao":null,"observacao":"- Rider de SOM anexo\n- Show Musical","notificacao":null,"observacaoChecklist":null,"observacaoArea":null,"possuiCusto":false,"custo":0.0,"valorPedido":0.0,"arquivos":[{"id":96000078244767,"arquivo":"Mapa_de_palco___Richard_Ferrarini_e_Grupo_2019-12-04-16-09-14.jpg","nome":"Mapa de palco - Richard Ferrarini e Grupo.jpg","alteravel":true}],"agrupamento":96000078244766,"agrupamentoMultiplo":false,"tecnicoId":16173,"tecnicoNome":"LEANDRO DE MELO PELAQUIM","acao":null,"local":96000000000010,"dataSolicitacao":{"id":96000078244769,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":"Convivência","localSessaoId":"96000000000010","statusLancamento":null,"statusLancamentoAnterior":null},"numeroPessoas":null,"status":null,"statusSolicitacao":"VERIFICADO","quantidade":null,"prazoArte":null,"prazoFinal":null,"indicacoes":null,"justificativa":null,"finalizadoEm":null,"alterado":false,"parcelas":[],"dataPrevistaPagamento":null,"responsaveis":[],"ultimaSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"primeiraSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"dataPrevistaSessao":null},{"id":96000087440152,"tmpId":null,"servicoPai":null,"servicoPaiArea":"Programação","template":"COMUNICACAO","item":96000000014806,"area":3,"areaNome":"Comunicação","itemDescricao":"Emkt/Convites Virtuais (PG)","descricao":"Emkt","observacao":"Com a programação completa","notificacao":null,"observacaoChecklist":null,"observacaoArea":null,"possuiCusto":false,"custo":0.0,"valorPedido":0.0,"arquivos":null,"agrupamento":96000087440153,"agrupamentoMultiplo":false,"tecnicoId":null,"tecnicoNome":null,"acao":null,"local":null,"dataSolicitacao":null,"numeroPessoas":null,"status":null,"statusSolicitacao":"PENDENTE","quantidade":null,"prazoArte":null,"prazoFinal":null,"indicacoes":null,"justificativa":null,"finalizadoEm":null,"alterado":false,"parcelas":[],"dataPrevistaPagamento":null,"responsaveis":[],"ultimaSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"primeiraSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"dataPrevistaSessao":null}],"plantonistaId":null,"plantonistaNome":null}],"recomendacaoEtaria":1,"lugares":null,"intergeracional":null,"tipoPrecificacao":"ABERTO","valorPadrao":0.0,"precificacoes":null,"local":96000000000010,"justificativaStatus":null,"faixasEtarias":null,"estimativaPublico":150,"tipoAssento":"SEM_ASSENTO","sinopseCompleta":"Um convite para uma viagem histórica pela música, partindo do período de transformação do Brasil colônia em um País com identidade própria, no final do século XIX, com compositores como Callado, Chiquinha Gonzaga e Ernesto Nazareth, chegando a Anacleto de Medeiros, Pixinguinha, Severino Araújo, K-Ximbinho, Jacob do Bandolim e Garoto. ","retiradaIngresso":96000000000006,"fotos":[{"id":96000089865629,"arquivo":"FLAUTA_IMG_3236_2019-12-04-16-11-24.JPG","nome":"FLAUTA IMG_3236.JPG","creditos":null,"principal":false,"alteravel":true},{"id":96000089865630,"arquivo":"CLARINETE_IMG_3066_2019-12-04-16-11-20.jpg","nome":"CLARINETE IMG_3066.jpg","creditos":null,"principal":true,"alteravel":true}],"anexos":[{"id":96000089865628,"arquivo":"Release___Reminiscencias___Richard_Ferrarini_e_Grupo_2019-12-04-16-11-17.docx","nome":"Release - Reminiscencias - Richard Ferrarini e Grupo.docx","alteravel":true}],"links":null,"fornecedores":[{"id":96000078245846,"fornecedorId":102744,"nome":"TOTEM EMPREENDIMENTOS CULTURAIS E ARTÍSTICOS LTDA - ME","contatoId":null,"nomeContato":null,"email":null,"telefone":null,"funcao":null,"funcaoDescricao":null,"isContato":false,"alteravel":null}],"contatoFornecedores":"William Villar\nwvilarproducaobol.com.br\nwvilareventosbol.com.br\n181540622\n1112502","setor":96000000000009,"setorNome":"PROGRAMAÇÃO ","projeto":96000049358737,"projetoNome":"Chorandinho","intencao":null,"formato":17,"linguagem":12,"genero":null,"realizacao":96000053632486,"tipoRealizacao":null,"subtipoRealizacao":null,"destinoTurismo":null,"destinoOutroEstadoId":null,"programatica":1000000553647,"ma":null,"sma":null,"cce":null,"go":96000064180553,"sgo":96000064181505,"desabilitaveis":{"linguagens":[{"id":12,"nome":"Música"}],"tags":null,"setorId":96000000000009,"setorNome":"PROGRAMAÇÃO ","formatoId":17,"formatoNome":"show","programaticaId":1000000553647,"programaticaMa":null,"programaticaNome":"Apresentação >> 3.3. Música","maId":null,"maNome":null,"smaId":null,"smaNome":null,"cceId":null,"cceNome":null,"goId":96000064180553,"goCodigo":222,"goNome":"222 - ESPETÁCULO MUSICAL","sgoId":96000064181505,"sgoCodigo":222001,"sgoNome":"222001 - ESPETÁCULO MUSICAL","tipoRealizacaoId":null,"tipoRealizacaoNome":null,"subtipoRealizacaoId":null,"subtipoRealizacaoNome":null},"cortejo":false,"usoInterno":false,"destaque":false,"permanente":false,"regular":false,"manutencao":false,"elegivelPcg":true,"acaoEducativa":false,"acessibilidadeUniversal":false,"acessibilidadeVisual":false,"acessibilidadeAuditiva":false,"hasAvaliacao":false,"avaliacaoRequerida":true,"custoRequerido":true,"solicitacoesRequeridas":[{"id":96000078245838,"hasSolicitacao":true,"area":1},{"id":96000078244735,"hasSolicitacao":true,"area":2},{"id":96000078245839,"hasSolicitacao":true,"area":2},{"id":96000078244704,"hasSolicitacao":true,"area":1},{"id":96000078245840,"hasSolicitacao":true,"area":3},{"id":96000078245841,"hasSolicitacao":true,"area":4},{"id":96000078244770,"hasSolicitacao":true,"area":7},{"id":96000078245842,"hasSolicitacao":true,"area":7},{"id":96000078245843,"hasSolicitacao":false,"area":5},{"id":96000078245844,"hasSolicitacao":false,"area":6},{"id":96000078244775,"hasSolicitacao":true,"area":4}],"servicos":[{"id":96000078244703,"tmpId":null,"servicoPai":null,"servicoPaiArea":"Programação","template":"ADMINISTRATIVO","item":96000000152195,"area":1,"areaNome":"Administrativo","itemDescricao":"CONTRATO - Apresentação Musical (PJ)","descricao":null,"observacao":null,"notificacao":null,"observacaoChecklist":null,"observacaoArea":null,"possuiCusto":true,"custo":5000.0,"valorPedido":6000.0,"arquivos":null,"agrupamento":null,"agrupamentoMultiplo":null,"tecnicoId":null,"tecnicoNome":null,"acao":null,"local":null,"dataSolicitacao":null,"numeroPessoas":null,"status":null,"statusSolicitacao":"PENDENTE","quantidade":null,"prazoArte":null,"prazoFinal":null,"indicacoes":null,"justificativa":null,"finalizadoEm":null,"alterado":false,"parcelas":[],"dataPrevistaPagamento":"12/04/2020","responsaveis":[],"ultimaSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"primeiraSessao":{"id":96000077783572,"dataInicio":"05/04/2020 17:00","dataFim":"05/04/2020 18:30","diaInteiro":false,"tecnicoNome":null,"tecnicoId":null,"localSessaoNome":null,"localSessaoId":null,"statusLancamento":null,"statusLancamentoAnterior":null},"dataPrevistaSessao":false}],"uo":null,"tecnico":"ROBERTO STURION SGARBIERO","tecnicoId":14065,"editadoPor":"MARCOS TADEU C.DA SILVA","dataModificacao":"25/03/2020 11:40","tags":null,"integracaoEstatistico":{"id":96000078245849,"atividadeId":96000077783571,"projetoId":null,"tipoIntegracao":"ESTATISTICO","status":"INTEGRAR","ativo":null,"dataIntegracao":"01/02/2020 19:54","dataAtualizacao":"25/03/2020 11:40","mensagem":"Será integrado","estatisticoId":null},"integracaoGestorCursos":null,"integracaoGestorTurismo":null,"faixasEtariasExcluidas":null,"precificacoesExcluidas":null,"datasExcluidas":null,"servicosExcluidos":null,"fornecedoresExcluidos":null,"contatosFornecedoresExcluidos":null,"linksExcluidos":null,"anexosExcluidos":null,"fotosExcluidas":null,"paises":null,"acessibilidades":null,"parcerias":null,"especificos":null,"pcg":false,"grupos":{"grupoAgendado":false,"escolas":false,"empresas":false,"instituicoes":false},"natureza":{"acaoInovadora":false,"acaoSustentavel":false,"manutencao":false,"destaque":false,"permanente":false,"usoInterno":false,"regular":false,"cessaoEspaco":false},"justificativaAcao":{"social":null,"recursos":null,"cultural":"A apresentação compõe o projeto Chorandinho, realizado pela unidade durante o mês de abril, em referência ao Dia Nacional do Choro. ","politico":null},"gratuidade":{"gratuito":true,"parcialmenteGratuito":false,"gratuidade":true},"rastreabilidade":"SEM_RASTREABILIDADE","focoPrioritario":"SEM_FOCO","detalheParcerias":null,"detalheAcessibilidade":null,"detalhePCG":null,"artistas":"William Villar","hasIntegracaoEstatistico":true,"hasIntegracaoCursos":false,"hasIntegracaoTurismo":false,"cursoId":null,"informarFormacao":false,"inscritosPorSessao":false,"dataInicioInscricao":null,"dataFimInscricao":null,"informacoes":null,"naoEditarPrecificacao":false,"naoEditarLugares":false,"sinopseAprovacao":"O grupo inicia sua pesquisa no período de transformação do Brasil em um País com identidade própria, com os compositores do final do século XIX, chegando aos nomes mais conhecidos do século XX. Um regional tradicional, com pandeiro, flauta/sax, violão e cavaco. A apresentação compõe o projeto Chorandinho, realizado pela unidade durante o mês de abril, em referência ao Dia Nacional do Choro. ","sinopseCurta":null
};
//Função de Validação do campo contato
//var contato = "\n nome@gmail.com \n 15 9999 0000"; //variável de teste



consistenciaAcao(acao_dados); //Enviar dados para ação

function consistenciaAcao(acao){
	var erros = [];
  var custo_total = 0;
  var percapita = 0;
  var carga_horaria = 0;
  var custo_hora_percapita = 0;

  //Verifica Integração com Estatístico
  !acao.hasIntegracaoEstatistico ? erros.push('Sem Integração com Estatístico'):null;

	//Verifica Contatos
	!possuiEmail(acao.contatoFornecedores) ? erros.push('Inserir email'):null;
	!possuiPhone(acao.contatoFornecedores) ? erros.push('Inserir telefone de contato, com DDD'):null;

	//Verificando Custos
	//Verificar Per Capita, Percapita Hora (Oficinas)

  //Calcula Percapita
	acao.servicos.forEach(function(item){
		item.custo != undefined? custo_total += item.custo:null;
	});
  percapita = custo_total / acao.estimativaPublico;

  //Calcula Duração Total em horas da ação
  acao.datas.forEach(function(item){
    carga_horaria += cD(item.dataAgenda.dataFim) - cD(item.dataAgenda.dataInicio);

    //verifica local aberto
    item.local == (96000000000009)? console.log('local aberto'):null;
  });
  carga_horaria /= toHours;

  custo_hora_percapita = custo_total/(carga_horaria * acao.estimativaPublico);

  console.log(acao);
  //console.log("Custo Hora / PerCapita: " + custo_hora_percapita);
  //console.log("Carga horário total: " + carga_horaria);
	console.log(erros);

}

// verifica se existe e-mail no campo, retorna true se encontrar e-mail'
function possuiEmail(email) {
  var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
  return re.test(email);
}

// verifica se existe telefone no campo, retorna true se encontrar e-mail
function possuiPhone(phone){
	var re = /\d\d ? \)?[\d ]{8,9}/;
	return re.test(phone);
}

/*
Verificação de Conflito de Espaços
 */

conflitoLocais(dados, false);  //Usar TRUE para listagem de conflitos

function conflitoLocais(dados, gerarLista){
	//Se for TRUE, trata de todos os espaço e exibe div com resultados
	//Se for FALSE, trata apenas do primeiro espaço dos dados e retorno list

	//Elencar locais usados, sem repetição
	var locais_usados = [];
	dados.forEach(function(entry){
		if (locais_usados.indexOf(entry.local) == -1){
			locais_usados.push(entry.local);
		}
	});

	//Filtra daados por local
	var acoes_local = [];
	locais_usados.forEach(function(entry){
		acoes_local = dados.filter(function(entry2){
			return entry2.local == entry;
		});
		if (gerarLista){gerarListagem(conflitoDatas(acoes_local))
		}else{
			return conflitoDatas(acoes_local);
		}
	});
}

//Gera lista de Atividades no Site
function gerarListagem(lista){

	if (document.getElementById('conteudo')== null){
		var iDiv = document.createElement('div');
		iDiv.className = 'siplus-listagem';
		iDiv.id = 'conteudo';
		$('body')[0].append(iDiv);

		var ul = document.createElement('ul');
		ul.id = 'listagem-resultados';
		iDiv.appendChild(ul);
	};


	lista.forEach(renderProductList);

	var lista = document.getElementById('listagem-resultados');

	function renderProductList(element, index, arr) {
		var li = document.createElement('li');
		var texto = '';
		li.setAttribute('class',element[3]);


		$('#listagem-resultados').append(li);

		texto = element[1].local + ' ' + '<br/>' +
				gD(element[1].start) +'</br>' +
				a[0] + endereco_acao[0] + element[1].atividadeId + endereco_acao[1] + element[1].atividadeId + a[1] + gH(element[1].start) + '\t>\t' + gH(element[1].end) + '\t' + element[1].title + a[2] +'</br>' +
				a[0] + endereco_acao[0] + element[2].atividadeId + endereco_acao[1] + element[2].atividadeId + a[1] + gH(element[2].start) + '\t>\t' + gH(element[2].end) + '\t' + element[2].title + a[2] +'</br>' +
				element[0] + '</br>';

		li.innerHTML=li.innerHTML + texto;
	}
};

// Reotorna lista com conflitos
function conflitoDatas(lista){ //Alimentar com lista de ações
	var resultado = [];
	for (var i = 0; i < lista.length; i++){
		if (typeof lista[i + 1] !== 'undefined'){
			var acao = lista[i];
			for (var j = i + 1; j < lista.length; j++){
				var comparada = lista[j];
				var res = isConflito(acao, comparada);
				if(res){
					resultado.push([res[0], acao, comparada,res[1]]);
				};
			}
		}

	}
	return resultado;
}

//Verifica conflito entre duas ações
function isConflito(acao, comparada){
	aInicio = cD(acao.start);
	aFim = cD(acao.end);
	bInicio = cD(comparada.start);
	bFim = cD(comparada.end);

	var diffEnd = bInicio - aFim;
	var diffStart = aInicio - bFim;


	if (diffEnd >= toHours){
		return false;
	}else if (diffEnd >= 0){
		return ['APERTO: Intervalo menor que 1h, pós','aperto'];
	}else{
		if(diffStart >= toHours){
			return false;
		}else if(diffStart > 0){
			return ['APERTO: Intervalor menor que 1h, pré','aperto'];

		}else{
			return ['CONFLITO: Atividade sobreposta','conflito'];
		}
	}
}


function gH(str){ //getHora return the time
	return str.match(/\d\d:\d\d/);
}

function gD(str){ //getHora return the time
	return str.match(/\d\d\/\d\d\/\d\d/);
}

function cD(data){ //Convert data do Formato Brasileiro para o Americano, para processamento
	//"start":"02/03/2020 14:30"
	var pattern = /(\d{2}).(\d{2}).(.*)/;
	return new Date(data.replace(pattern,'$2/$1/$3'));
}
