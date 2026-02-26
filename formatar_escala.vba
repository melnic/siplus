Sub RemoverParagrafosEmBranco()
    Dim paragrafo As Paragraph
    Dim contador As Integer
    
    contador = 0
    
    ' Percorre todos os parágrafos do documento
    For Each paragrafo In ActiveDocument.Paragraphs
        ' Verifica se o parágrafo está em branco (só contém marca de parágrafo)
        If Len(Trim(paragrafo.Range.Text)) = 1 Then
            ' Apaga o parágrafo (exceto o último para evitar erro)
            If paragrafo.Range.Start < ActiveDocument.Range.End - 1 Then
                paragrafo.Range.Delete
                contador = contador + 1
            End If
        End If
    Next paragrafo
    
    MsgBox contador & " parágrafo(s) em branco removido(s).", vbInformation, "Concluído"
End Sub

Sub GerarIndiceDaEscala()
    Dim paragrafo As Paragraph
    Dim regex As Object
    Dim contador As Integer
    Dim textoInicio As String
    
    ' Criar objeto RegExp
    Set regex = CreateObject("VBScript.RegExp")
    
    ' Configurar padrão Regex para data no formato DD/MM/AAAA - Dia da semana
    With regex
        .Pattern = "^\d{2}/\d{2}/\d{4}\s+-\s+.*"
        .IgnoreCase = True
        .Global = False
        .Multiline = True
    End With
    
    contador = 0
    
    ' Desativar atualização de tela para melhor performance
    Application.ScreenUpdating = False
    
    ' Percorrer todos os parágrafos do documento
    For Each paragrafo In ActiveDocument.Paragraphs
        ' Pega o início do texto do parágrafo (primeiros 60 caracteres é suficiente)
        textoInicio = Left(paragrafo.Range.Text, 60)
        
        ' Verificar se o início do parágrafo corresponde ao padrão
        If regex.Test(textoInicio) Then
            ' Aplicar estilo Título 2
            paragrafo.Range.Style = "Título 2"
            contador = contador + 1
        End If
    Next paragrafo
    
    ' Reativar atualização de tela
    Application.ScreenUpdating = True
    
    ' Mensagem de conclusão
    MsgBox contador & " parágrafo(s) formatado(s) com Título 2.", vbInformation, "Concluído"
    
    RemoverParagrafosEmBranco
End Sub
