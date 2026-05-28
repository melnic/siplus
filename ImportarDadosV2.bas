Public Sub FromClipboard()
    On Error GoTo ErrorHandler
    
    Dim texto As String
    Dim dataObj As New MSForms.DataObject
    
    ' Obter texto do clipboard
    dataObj.GetFromClipboard
    texto = dataObj.GetText()
    Debug.Print "Text saved from Clipboard: '" & texto & "'"
    
    ' Parse dos dados
    Dim titulo As String
    Dim contratado As String
    Dim datas As String
    Dim total As String
    Dim parcelas As String
    
    Call ParseClipboardData(texto, titulo, contratado, datas, total, parcelas)
    
    ' Obter formato selecionado
    Dim formato As String
    formato = GetFormatoSelecionado()
    If formato = "" Then Exit Sub
    
    ' Configurar documento
    Call ConfigurarDocumento(formato, titulo, contratado, datas, total, parcelas)
    
    Exit Sub
    
ErrorHandler:
    MsgBox "Erro " & Err.Number & ": " & Err.Description, vbCritical, "Erro"
End Sub

Private Sub ParseClipboardData(texto As String, ByRef titulo As String, ByRef contratado As String, _
                                ByRef datas As String, ByRef total As String, ByRef parcelas As String)
    
    Dim pares As Variant
    Dim par As Variant
    Dim partes() As String
    Dim nome As String
    Dim valor As String
    
    If texto = "" Then Exit Sub
    
    pares = Split(texto, "|")
    
    For Each par In pares
        If InStr(par, "=") > 0 Then
            partes = Split(par, "=")
            If UBound(partes) >= 1 Then
                nome = Trim(partes(0))
                valor = Trim(partes(1))
                
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
            End If
        End If
    Next par
End Sub

Private Function GetFormatoSelecionado() As String
    Const PROMPT As String = "Escolha um tipo de carta:" & vbNewLine & _
                            "0. PF" & vbNewLine & _
                            "1. oficina" & vbNewLine & _
                            "2. dança" & vbNewLine & _
                            "3. intervencao / narração / esportiva" & vbNewLine & _
                            "4. musica" & vbNewLine & _
                            "5. circo" & vbNewLine & _
                            "6. teatro"
    
    Dim result As Variant
    Dim formatos As Variant
    
    formatos = Array("PF", "oficina", "danca", "intervencao", "musica", "circo", "teatro")
    
    Do
        result = InputBox(PROMPT, "Digitar número", "0")
        If result = "" Then Exit Function
        
        If IsNumeric(result) And result >= 0 And result <= 6 Then
            GetFormatoSelecionado = formatos(CInt(result))
            Exit Do
        End If
        
        MsgBox "Por favor, digite um número entre 0 e 6.", vbExclamation
    Loop
End Function

Private Sub ConfigurarDocumento(formato As String, titulo As String, contratado As String, _
                                 datas As String, total As String, parcelas As String)
    
    ' Configurar textos do formato
    Call ConfigurarFormatoTexto(formato)
    
    ' Apagar bookmarks conforme formato
    Call ApagarBookmarksPorFormato(formato)
    
    ' Inserir dados no cabeçalho
    Call InserirDadosCabecalho(formato, titulo, contratado, datas, total, parcelas)
End Sub

Private Sub ConfigurarFormatoTexto(formato As String)
    Dim textoFormato As String
    
    Select Case formato
        Case "oficina"
            textoFormato = "oficina de"
        Case "danca"
            textoFormato = "apresentação de dança"
        Case "intervencao"
            textoFormato = "intervenção"
        Case "musica"
            textoFormato = "apresentação de música"
        Case "circo"
            textoFormato = "apresentação de circo"
        Case "teatro"
            textoFormato = "apresentação de teatro"
        Case Else
            Exit Sub
    End Select
    
    Call SetBookmarkText("formato", textoFormato)
    Call SetBookmarkText("formato2", textoFormato)
End Sub

Private Sub ApagarBookmarksPorFormato(formato As String)
    Dim allDocuments() As String
    Dim oneDocument() As String
    Dim i As Long
    Dim j As Long
    Dim encontrado As Boolean
    
    ' Todos os documentos possíveis
    allDocuments = Split("ecad, vinculo, sbat, drt, autoria_danca, seguro, art", ", ")
    
    ' Definir quais documentos manter baseado no formato
    Select Case formato
        Case "PF"
            oneDocument = Split("", ",")
            ' Apagar bookmarks PJ
            Call SetBookmarkText("quadro2_PJ", "")
            Call SetBookmarkText("quadro3_PJ", "")
            Call SetBookmarkText("quadro_representante_PJ", "")
            Exit Sub  ' PF não precisa do loop abaixo
            
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
        Case Else
            Exit Sub
    End Select
    
    ' Apagar documentos que não estão em oneDocument
    For i = LBound(allDocuments) To UBound(allDocuments)
        encontrado = False
        For j = LBound(oneDocument) To UBound(oneDocument)
            If Trim(allDocuments(i)) = Trim(oneDocument(j)) Then
                encontrado = True
                Exit For
            End If
        Next j
        If Not encontrado Then
            Call SetBookmarkText(Trim(allDocuments(i)), "")
        End If
    Next i
    
    ' Apagar bookmarks PF
    Call SetBookmarkText("quadro2_PF", "")
    Call SetBookmarkText("quadro3_PF", "")
End Sub

Private Sub InserirDadosCabecalho(formato As String, titulo As String, contratado As String, _
                                   datas As String, total As String, parcelas As String)
    
    ' Inserir dados da ação
    If formato <> "musica" Then
        Call SetBookmarkText("titulo_acao", titulo)
        Call SetBookmarkText("contratado", contratado)
    Else
        Call SetBookmarkText("titulo_acao", contratado)
        Call SetBookmarkText("contratado", titulo)
        Call SetBookmarkText("hifen", " - ")
    End If
    
    ' Inserir outros dados
    Call SetBookmarkText("horarios", datas)
    Call SetBookmarkText("total", total)
    Call SetBookmarkText("parcelas", parcelas)
    
    ' Dados da declaração de vínculo
    Call SetBookmarkText("titulo_vinculo", titulo)
    Call SetBookmarkText("datas_vinculo", datas)
    
    ' Remover introdução de parcelas se não houver parcelas
    If parcelas = "" Then
        Call SetBookmarkText("intro_parcelas", "")
    End If
End Sub

Private Sub SetBookmarkText(bookmarkName As String, textValue As String)
    On Error Resume Next
    If ActiveDocument.Bookmarks.Exists(bookmarkName) Then
        ActiveDocument.Bookmarks(bookmarkName).Range.Text = textValue
    Else
        Debug.Print "Bookmark não encontrado: " & bookmarkName
    End If
    On Error GoTo 0
End Sub
