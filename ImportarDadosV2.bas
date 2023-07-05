Attribute VB_Name = "NewMacros"
Public Sub FromClipboard()

'Dim clipboard As DataObject
Dim texto As String

'Set clipboard = New DataObject
'clipboard.GetFromClipboard
'texto = clipboard.GetText

'Modelo 2 de texto do clipboard
Dim dataObj As New MSForms.DataObject
    
        dataObj.GetFromClipboard
        texto = dataObj.GetText()
        On Error GoTo 0
        Debug.Print ("Text saved from Clipboard: '" & strText & "'")

' dividir texto em pares variável-valor separados por "|"
Dim pares As Variant
pares = Split(texto, "|")

' percorrer cada par variável-valor e atribuir valores às variáveis correspondentes
' [titulo, contratado, datas, total, parcelas]
Dim titulo As String
Dim contratado As String
Dim datas As String
Dim total As String
Dim parcelas As String
Dim formato As String

' Variáveis do loop de ocultações
Dim allDocuments() As String
Dim oneDocument() As String
Dim i As Long
Dim j As Long
Dim encontrado As Boolean


'Faz o parsing dos dados trazidos pela clipboard
For Each par In pares
    Dim nome As String
    Dim valor As String
    nome = Split(par, "=")(0) ' extrai o nome da variável do par atual
    valor = Split(par, "=")(1) ' extrai o valor correspondente do par atual
    
    Select Case nome
        Case "titulo"
            titulo = valor
        Case "contratado"
            contratado = valor
        Case "datas"
            datas = valor
        Case "total"
            total = valor
        Case "parcelas"
            parcelas = valor
    End Select
Next

' AJUSTA QUADROS DO DOCUMENTO
' Outros bookmarks do documento
' Dados para Pagamento: quadro2_PF, quadro2_PJ
' Dados contratado: quadro3_PF, quadro3_PJ
' Dados PJ: quadro_representante_PJ
' Formato da ação: formato
' ecad, vinculo, sbat, drt, autoria_danca, seguro, art

allDocuments = Split("ecad, vinculo, sbat, drt, autoria_danca, seguro, art", ", ")

    Dim promptText As String
    Dim result As Integer
    
    ' pf, circo, danca, intervencao, musica, oficina, teatro
    
    promptText = "Escolha um tipo de carta:" & vbNewLine & "0. PF" & vbNewLine & "1. oficina" & vbNewLine & "2. dança" & vbNewLine & "3. intervencao / narração / esportiva" & vbNewLine & "4. musica" & vbNewLine & "5. circo" & vbNewLine & "6. teatro"
    result = InputBox(promptText, "Digitar número")
    
    Select Case result
        Case 0
            formato = "PF"
            
        Case 1
            formato = "oficina"
            ActiveDocument.Bookmarks("formato").Range.Text = "oficina de"
            ActiveDocument.Bookmarks("formato2").Range.Text = "oficina de"
        Case 2
            formato = "danca"
            ActiveDocument.Bookmarks("formato").Range.Text = "apresentação de dança"
            ActiveDocument.Bookmarks("formato2").Range.Text = "apresentação de dança"
        Case 3
            formato = "intervencao"
            ActiveDocument.Bookmarks("formato").Range.Text = "intervenção"
            ActiveDocument.Bookmarks("formato2").Range.Text = "intervenção"
        Case 4
            formato = "musica"
            ActiveDocument.Bookmarks("formato").Range.Text = "apresentação de música"
            ActiveDocument.Bookmarks("formato2").Range.Text = "apresentação de música"
        Case 5
            formato = "circo"
            ActiveDocument.Bookmarks("formato").Range.Text = "apresentação de circo"
            ActiveDocument.Bookmarks("formato2").Range.Text = "apresentação de circo"
        Case 6
            formato = "teatro"
            ActiveDocument.Bookmarks("formato").Range.Text = "apresentação de teatro"
            ActiveDocument.Bookmarks("formato2").Range.Text = "apresentação de teatro"

    End Select

Select Case formato
    Case "PF"
        oneDocument = Split("", ",")
        ActiveDocument.Bookmarks("quadro2_PJ").Range.Font.Hidden = True
        ActiveDocument.Bookmarks("quadro3_PJ").Range.Font.Hidden = True
        ActiveDocument.Bookmarks("quadro_representante_PJ").Range.Font.Hidden = True
    
    Case "circo"
        oneDocument = Split("ecad,vinculo,drt,seguro,art", ",")
    
    Case "danca"
        oneDocument = Split("ecad,vinculo,drt,autoria_danca", ",")
    
    Case "intervencao"
        oneDocument = Split("ecad,vinculo", ",")
    
    Case "musica"
        oneDocument = Split("ecad,vinculo", ",")
    
    Case "oficina"
        oneDocument = Split("vinculo", ",")
    
    Case "teatro"
        oneDocument = Split("ecad,sbat,vinculo,drt", ",")

End Select

' For i = LBound(apagarTrechos) To UBound(apagarTrechos)
'         ActiveDocument.Bookmarks(apagarTrechos(i)).Range.Text = ""
'         MsgBox "Apaguei item" & apagarTrechos(i)
'     Next i
    


' Defina os valores das matrizes 1 e 2

' oneDocument = Split("ecad, vinculo, drt", ",")

' Verifica se os valores da matriz1 não estão presentes na matriz2

If Not formato = "PF" Then
    For i = LBound(allDocuments) To UBound(allDocuments)
        encontrado = False
        For j = LBound(oneDocument) To UBound(oneDocument)
            If allDocuments(i) = oneDocument(j) Then
                encontrado = True
                Exit For
            End If
        Next j
        If Not encontrado Then
            ActiveDocument.Bookmarks(allDocuments(i)).Range.Font.Hidden = True
        End If
    Next i
    ActiveDocument.Bookmarks("quadro2_PF").Range.Font.Hidden = True
    ActiveDocument.Bookmarks("quadro3_PF").Range.Font.Hidden = True
End If

' Insere dados da ação puxados do Siplan e copiados no Clipboard
' Inserir dados no cabeçalho da carta proposta

    If Not formato = "musica" Then
        ActiveDocument.Bookmarks("titulo_acao").Range.Text = titulo
        ActiveDocument.Bookmarks("contratado").Range.Text = contratado
    Else
        ActiveDocument.Bookmarks("titulo_acao").Range.Text = contratado
        ActiveDocument.Bookmarks("contratado").Range.Text = titulo
        ActiveDocument.Bookmarks("hifen").Range.Text = " - "
    End If
    
    ActiveDocument.Bookmarks("horarios").Range.Text = datas
    ActiveDocument.Bookmarks("total").Range.Text = total
    ActiveDocument.Bookmarks("parcelas").Range.Text = parcelas
    
    ' Insere dados da Declaração de Vínculo
    ActiveDocument.Bookmarks("titulo_vinculo").Range.Text = titulo
    ActiveDocument.Bookmarks("datas_vinculo").Range.Text = datas
    
    If parcelas = "" Then
        ActiveDocument.Bookmarks("intro_parcelas").Range.Text = ""
    End If

End Sub

