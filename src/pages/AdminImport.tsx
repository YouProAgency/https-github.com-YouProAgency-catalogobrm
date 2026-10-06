import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Eye,
  FileText,
  AlertCircle,
  Database,
  Layers,
  LogOut,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  ParsedProductRow,
  upsertProductBatch,
  ImportResult,
  ImportProgressStats,
  IgnoredRowDetail,
  isExcludedSku,
  isConformeAmostra,
  isEletrodiesel,
  sanitizeProductUnit,
} from '@/services/products'
import { formatCurrencyBRL } from '@/lib/utils'

function parsePrice(val: any): number | null {
  if (val === null || val === undefined || val === '') return null
  if (typeof val === 'number') {
    return isNaN(val) ? null : val
  }
  const str = String(val).trim().replace('R$', '').trim()
  if (!str) return null

  // Brazilian format: "1.234,56" or "123,45" vs standard "123.45"
  let normalized = str
  if (normalized.includes(',') && normalized.includes('.')) {
    // e.g. 1.234,56
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  } else if (normalized.includes(',')) {
    // e.g. 123,45
    normalized = normalized.replace(',', '.')
  }

  const num = parseFloat(normalized)
  return isNaN(num) ? null : num
}

function normalizeHeader(val: any): string {
  if (val === null || val === undefined) return ''
  return String(val)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]/g, '')
}

export default function AdminImport() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const [fileName, setFileName] = useState<string>('')
  const [fileSize, setFileSize] = useState<string>('')
  const [rawRowsCount, setRawRowsCount] = useState<number>(0)
  const [detectedMappingMode, setDetectedMappingMode] = useState<'header' | 'position'>('position')
  const [salePriceColName, setSalePriceColName] = useState<string>('Preço 1 (Padrão)')
  const [validRows, setValidRows] = useState<ParsedProductRow[]>([])
  const [ignoredRowsCount, setIgnoredRowsCount] = useState<number>(0)
  const [conformeAmostraIgnoredCount, setConformeAmostraIgnoredCount] = useState<number>(0)
  const [eletrodieselIgnoredCount, setEletrodieselIgnoredCount] = useState<number>(0)
  const [skuExcluidoIgnoredCount, setSkuExcluidoIgnoredCount] = useState<number>(0)
  const [ignoredDetails, setIgnoredDetails] = useState<IgnoredRowDetail[]>([])
  const [isParsing, setIsParsing] = useState<boolean>(false)

  const [isImporting, setIsImporting] = useState<boolean>(false)
  const [progressPercent, setProgressPercent] = useState<number>(0)
  const [processedCount, setProcessedCount] = useState<number>(0)
  const [liveStats, setLiveStats] = useState<ImportProgressStats>({
    imported: 0,
    updated: 0,
    failed: 0,
    retrying: false,
    retryCount: 0,
    currentStatusText: '',
  })
  const [finalResult, setFinalResult] = useState<ImportResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileProcess = async (file: File) => {
    setParseError(null)
    setFinalResult(null)
    setIsParsing(true)
    setFileName(file.name)
    setFileSize((file.size / 1024).toFixed(1) + ' KB')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        throw new Error('A planilha está vazia ou não possui abas.')
      }

      const worksheet = workbook.Sheets[sheetName]
      // Read raw matrix rows with header: 1 (0-indexed columns array)
      const data: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: true,
        defval: '',
      })

      setRawRowsCount(data.length)

      const parsed: ParsedProductRow[] = []
      const currentIgnoredDetails: IgnoredRowDetail[] = []
      let ignored = 0
      let amostraCount = 0
      let eletrodieselCount = 0
      let skuExcluidoCount = 0

      // Análise de cabeçalho resiliente:
      // Inspeciona as primeiras 5 linhas para detectar se alguma linha contém cabeçalhos
      // com palavras-chave típicas ("sku", "codigo", "descricao", "preco", "precovenda", etc.)
      let headerRowIndex = -1
      let colMap = {
        sku: 1,
        unit: 3,
        name: 4,
        category: 5,
        brand: 6,
        salePrice: 7, // Preço Venda público
        price1: 7,
        price2: 8,
        price3: 9,
      }

      for (let r = 0; r < Math.min(data.length, 5); r++) {
        const row = data[r]
        if (!Array.isArray(row)) continue

        const normalizedCells = row.map(normalizeHeader)
        const hasSku = normalizedCells.some((c) =>
          ['sku', 'codigo', 'cod', 'codprod', 'referencia'].includes(c),
        )
        const hasDesc = normalizedCells.some((c) =>
          ['descricao', 'nome', 'produto', 'desc', 'descricaoproduto'].includes(c),
        )
        const hasPreco = normalizedCells.some((c) => c.includes('preco') || c.includes('valor'))

        if ((hasSku && hasDesc) || (hasDesc && hasPreco) || (hasSku && hasPreco)) {
          headerRowIndex = r
          break
        }
      }

      let detectedSalePriceLabel = 'Preço 1 / Coluna 8'

      if (headerRowIndex !== -1) {
        setDetectedMappingMode('header')
        const headerRow = data[headerRowIndex]
        const normHeader = headerRow.map(normalizeHeader)

        // Localiza colunas por nome
        const skuIdx = normHeader.findIndex((c) =>
          ['sku', 'codigo', 'cod', 'codprod', 'referencia', 'item'].includes(c),
        )
        const nameIdx = normHeader.findIndex((c) =>
          ['descricao', 'nome', 'descricaoproduto', 'produto', 'desc', 'denominacao'].includes(c),
        )
        const unitIdx = normHeader.findIndex((c) =>
          ['unidade', 'unid', 'un', 'und', 'u'].includes(c),
        )
        const catIdx = normHeader.findIndex((c) =>
          ['categoria', 'grupo', 'familiadeproduto', 'familia', 'depto'].includes(c),
        )
        const brandIdx = normHeader.findIndex((c) =>
          ['marca', 'fabricante', 'brand', 'fornecedor'].includes(c),
        )

        // Identifica coluna "Preço Venda" explicitamente
        let saleIdx = normHeader.findIndex(
          (c) =>
            c === 'precovenda' ||
            c === 'precovend' ||
            c === 'prvenda' ||
            c === 'valorvenda' ||
            c === 'venda' ||
            (c.includes('preco') && c.includes('venda')) ||
            (c.includes('valor') && c.includes('venda')),
        )

        // Encontra todas as colunas que contenham "preco" ou "valor" ou "pr"
        const allPriceIndices: number[] = []
        normHeader.forEach((c, idx) => {
          if (
            c.includes('preco') ||
            c.includes('valor') ||
            c === 'pr1' ||
            c === 'pr2' ||
            c === 'pr3'
          ) {
            allPriceIndices.push(idx)
          }
        })

        // Se encontrou Preço Venda nomeado
        if (saleIdx !== -1) {
          detectedSalePriceLabel = String(headerRow[saleIdx] || 'Preço Venda')
        } else if (allPriceIndices.length > 0) {
          // Se não encontrou coluna com nome explícito de "venda", pega a primeira coluna de preço como venda
          saleIdx = allPriceIndices[0]
          detectedSalePriceLabel = String(headerRow[saleIdx] || `Preço ${saleIdx + 1}`)
        } else {
          saleIdx = 7
        }

        colMap = {
          sku: skuIdx !== -1 ? skuIdx : 1,
          name: nameIdx !== -1 ? nameIdx : 4,
          unit: unitIdx !== -1 ? unitIdx : 3,
          category: catIdx !== -1 ? catIdx : 5,
          brand: brandIdx !== -1 ? brandIdx : 6,
          salePrice: saleIdx,
          price1: allPriceIndices[0] ?? 7,
          price2: allPriceIndices[1] ?? 8,
          price3: allPriceIndices[2] ?? 9,
        }
      } else {
        // Sem cabeçalho detectado: mapeamento posicional validado para ADV_Produtos_Mangueiras
        // Coluna 2 (índice 1): SKU
        // Coluna 4 (índice 3): Unidade
        // Coluna 5 (índice 4): Descrição
        // Coluna 6 (índice 5): Categoria
        // Coluna 7 (índice 6): Marca
        // Coluna 8 (índice 7): Preço 1 -> Mapeado como Preço Venda principal
        // Coluna 9 (índice 8): Preço 2
        // Coluna 10 (índice 9): Preço 3
        setDetectedMappingMode('position')
        colMap = {
          sku: 1,
          unit: 3,
          name: 4,
          category: 5,
          brand: 6,
          salePrice: 7,
          price1: 7,
          price2: 8,
          price3: 9,
        }
        detectedSalePriceLabel = 'Coluna 8 (Preço 1 / Preço Venda)'
      }

      setSalePriceColName(detectedSalePriceLabel)

      const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 0

      for (let i = startRow; i < data.length; i++) {
        const row = data[i]
        if (!row || !Array.isArray(row) || row.length === 0) {
          ignored++
          continue
        }

        const rawSku = row[colMap.sku] !== undefined ? String(row[colMap.sku]).trim() : ''
        const rawName = row[colMap.name] !== undefined ? String(row[colMap.name]).trim() : ''
        const rawUnitCandidate =
          row[colMap.unit] !== undefined ? String(row[colMap.unit]).trim() : ''
        const cleanUnit = sanitizeProductUnit(rawUnitCandidate, rawName)

        // Discard row if missing mandatory SKU or product Name
        if (!rawSku || !rawName) {
          ignored++
          currentIgnoredDetails.push({
            rowNumber: i + 1,
            sku: rawSku || undefined,
            name: rawName || undefined,
            reason: 'Ausência de SKU ou Nome/Cabeçalho descartado',
          })
          continue
        }

        // Blindagem de SKUs excluídos permanentemente (ex.: SKU 2713 Supersteam)
        if (isExcludedSku(rawSku)) {
          ignored++
          skuExcluidoCount++
          currentIgnoredDetails.push({
            rowNumber: i + 1,
            sku: rawSku,
            name: rawName,
            reason: `SKU ${rawSku} excluído permanentemente do catálogo por solicitação de negócio`,
          })
          continue
        }

        const rawCategory =
          row[colMap.category] !== undefined ? String(row[colMap.category]).trim() : ''
        const rawBrand = row[colMap.brand] !== undefined ? String(row[colMap.brand]).trim() : ''

        // Pula produtos cuja descrição/nome/unidade contenha "conforme amostra"
        // (produtos personalizados vendidos exclusivamente em loja física)
        if (isConformeAmostra({ name: rawName, unit: rawUnitCandidate })) {
          ignored++
          amostraCount++
          currentIgnoredDetails.push({
            rowNumber: i + 1,
            sku: rawSku,
            name: rawName,
            reason: 'Produto personalizado / Conforme amostra (venda exclusiva em loja física)',
          })
          continue
        }

        // Pula mangueiras da marca "Eletrodiesel"
        // (produtos personalizáveis vendidos exclusivamente em loja física)
        if (isEletrodiesel({ brand: rawBrand })) {
          ignored++
          eletrodieselCount++
          currentIgnoredDetails.push({
            rowNumber: i + 1,
            sku: rawSku,
            name: rawName,
            reason: 'Marca personalizável / Eletrodiesel (venda exclusiva em loja física)',
          })
          continue
        }

        const salePrice = parsePrice(row[colMap.salePrice])
        const price1 = parsePrice(row[colMap.price1])
        const price2 = parsePrice(row[colMap.price2])
        const price3 = parsePrice(row[colMap.price3])

        parsed.push({
          sku: rawSku,
          name: rawName,
          unit: cleanUnit,
          category: rawCategory,
          brand: rawBrand,
          price: salePrice ?? price1, // Preço Venda gravado no campo price do PocketBase
          price1,
          price2,
          price3,
          rawRowNumber: i + 1,
        })
      }

      setValidRows(parsed)
      setIgnoredRowsCount(ignored)
      setConformeAmostraIgnoredCount(amostraCount)
      setEletrodieselIgnoredCount(eletrodieselCount)
      setSkuExcluidoIgnoredCount(skuExcluidoCount)
      setIgnoredDetails(currentIgnoredDetails)
    } catch (err: any) {
      console.error('Erro ao ler arquivo:', err)
      setParseError(
        err.message ||
          'Falha ao processar o arquivo. Verifique se é um arquivo .xlsx ou .csv válido.',
      )
      setValidRows([])
    } finally {
      setIsParsing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileProcess(file)
    }
  }

  const handleStartImport = async () => {
    if (validRows.length === 0) return

    setIsImporting(true)
    setProgressPercent(0)
    setProcessedCount(0)
    setLiveStats({
      imported: 0,
      updated: 0,
      failed: 0,
      retrying: false,
      retryCount: 0,
      currentStatusText: 'Iniciando importação controlada...',
    })
    setFinalResult(null)

    try {
      const result = await upsertProductBatch(validRows, (processed, total, stats) => {
        setProcessedCount(processed)
        setProgressPercent(Math.round((processed / total) * 100))
        setLiveStats(stats)
      })

      result.skippedCount = ignoredRowsCount
      result.ignoredDetails = ignoredDetails
      setFinalResult(result)
    } catch (err: any) {
      console.error('Erro na importação:', err)
      setParseError('Ocorreu uma falha inesperada durante a importação em lote.')
    } finally {
      setIsImporting(false)
    }
  }

  const resetAll = () => {
    setFileName('')
    setFileSize('')
    setRawRowsCount(0)
    setDetectedMappingMode('position')
    setSalePriceColName('Preço 1 (Padrão)')
    setValidRows([])
    setIgnoredRowsCount(0)
    setConformeAmostraIgnoredCount(0)
    setEletrodieselIgnoredCount(0)
    setSkuExcluidoIgnoredCount(0)
    setIgnoredDetails([])
    setFinalResult(null)
    setParseError(null)
    setProgressPercent(0)
    setProcessedCount(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-8 max-w-6xl pb-20">
      {/* Header breadcrumb & title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold mb-1">
            <span>Administração</span>
            <span>/</span>
            <span>Importação de Catálogo</span>
          </div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">
            Importar Produtos da Planilha
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Faça upload do arquivo <span className="font-semibold text-secondary">.xlsx</span> ou{' '}
            <span className="font-semibold text-secondary">.csv</span> para atualizar o banco de
            dados BRM Mangueiras.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded border border-border">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>
              Conectado como: <strong className="text-secondary">{user?.email || 'admin'}</strong>
            </span>
          </div>
          <Button variant="outline" asChild className="rounded-sm font-bold border-border">
            <Link to="/">Ver Catálogo Público</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="rounded-sm font-bold text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
            title="Sair do modo administrador"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>

      {/* Upload Zone Card */}
      <Card className="border-border shadow-sm rounded-sm bg-white">
        <CardHeader className="bg-secondary/5 border-b border-border p-6">
          <CardTitle className="text-lg font-bold text-secondary flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            1. Selecionar Arquivo de Dados
          </CardTitle>
          <CardDescription>
            A detecção automática analisa a planilha: se houver linha de cabeçalho, mapeia por nomes
            (identificando a coluna <strong>Preço Venda</strong>); se não houver, aplica o
            mapeamento posicional comprovado (coluna 2 = SKU, coluna 4 = Unidade, coluna 5 =
            Descrição, coluna 6 = Categoria, coluna 7 = Marca, coluna 8 = Preço Venda, colunas 9 e
            10 = Preços 2 e 3).
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
            id="product-file-input"
            disabled={isParsing || isImporting}
          />

          {!fileName ? (
            <label
              htmlFor="product-file-input"
              className="border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 transition-colors rounded-sm p-10 flex flex-col items-center justify-center cursor-pointer text-center group"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg text-secondary mb-1">
                Clique para selecionar a planilha de produtos
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Suporta arquivos Excel (.xlsx, .xls) e arquivos de texto separado por vírgula
                (.csv).
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-white border-border">
                  Sem cabeçalho (detectado)
                </Badge>
                <Badge variant="outline" className="text-xs bg-white border-border">
                  Upsert por SKU
                </Badge>
                <Badge variant="outline" className="text-xs bg-white border-border">
                  Processamento em lote
                </Badge>
              </div>
            </label>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 border border-border rounded-sm gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-secondary text-base">{fileName}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>Tamanho: {fileSize}</span>
                    <span>•</span>
                    <span>Total de linhas: {rawRowsCount}</span>
                    <span>•</span>
                    <Badge
                      variant="outline"
                      className="text-[11px] font-semibold border-primary/40 text-primary bg-primary/5"
                    >
                      {detectedMappingMode === 'header'
                        ? 'Cabeçalho Identificado'
                        : 'Mapeamento Posicional'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[11px] font-semibold border-emerald-500/40 text-emerald-700 bg-emerald-50"
                    >
                      Preço Venda: {salePriceColName}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAll}
                  disabled={isImporting}
                  className="rounded-sm font-bold border-border"
                >
                  Trocar Arquivo
                </Button>
              </div>
            </div>
          )}

          {isParsing && (
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground bg-muted/40 p-4 rounded-sm">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              Processando estrutura da planilha...
            </div>
          )}

          {parseError && (
            <Alert variant="destructive" className="mt-4 rounded-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao processar</AlertTitle>
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview Section if file parsed */}
      {validRows.length > 0 && !finalResult && (
        <Card className="border-border shadow-sm rounded-sm bg-white">
          <CardHeader className="bg-secondary/5 border-b border-border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-secondary flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                2. Pré-Visualização do Mapeamento Aplicado
              </CardTitle>
              <CardDescription className="mt-1">
                Mostrando as primeiras 20 linhas de um total de{' '}
                <strong className="text-secondary">{validRows.length}</strong> produtos válidos
                prontos para gravação. Apenas o valor da coluna{' '}
                <strong className="text-primary font-semibold">Preço Venda</strong> será visível
                para o consumidor final no catálogo.
                {ignoredRowsCount > 0 && (
                  <span className="text-amber-600 block sm:inline sm:ml-2">
                    ({ignoredRowsCount} linhas ignoradas
                    {skuExcluidoIgnoredCount > 0 &&
                      `, sendo ${skuExcluidoIgnoredCount} com SKU excluído permanente (ex: 2713)`}
                    {conformeAmostraIgnoredCount > 0 &&
                      `, sendo ${conformeAmostraIgnoredCount} "conforme amostra"`}
                    {eletrodieselIgnoredCount > 0 &&
                      `, sendo ${eletrodieselIgnoredCount} da marca "Eletrodiesel"`}
                    ).
                  </span>
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleStartImport}
                disabled={isImporting}
                className="bg-primary hover:bg-primary/90 text-white font-bold rounded-sm h-11 px-6 shadow-sm flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Gravando no Banco...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" /> Confirmar e Gravar ({validRows.length})
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          {/* Progress bar when importing */}
          {isImporting && (
            <div className="p-6 bg-secondary/5 border-b border-border space-y-4">
              <div className="flex justify-between items-center text-sm font-bold text-secondary">
                <span className="flex items-center gap-2">
                  <RefreshCw
                    className={`h-4 w-4 text-primary ${liveStats.retrying ? 'animate-bounce text-amber-500' : 'animate-spin'}`}
                  />
                  {liveStats.retrying
                    ? 'Aguardando intervalo de rate limit para retentar lote...'
                    : `Gravando produtos na coleção 'products'... (${processedCount} de ${validRows.length})`}
                </span>
                <span className="text-primary font-mono">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-3 rounded-full" />

              {liveStats.currentStatusText && (
                <p
                  className={`text-xs ${liveStats.retrying ? 'text-amber-700 font-semibold bg-amber-50 p-2 rounded border border-amber-200' : 'text-muted-foreground'}`}
                >
                  {liveStats.currentStatusText}
                </p>
              )}

              <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs">
                <div className="bg-white p-2 rounded border border-border">
                  <span className="text-muted-foreground block">Novos importados</span>
                  <strong className="text-base text-emerald-600">{liveStats.imported}</strong>
                </div>
                <div className="bg-white p-2 rounded border border-border">
                  <span className="text-muted-foreground block">Atualizados (SKU existente)</span>
                  <strong className="text-base text-blue-600">{liveStats.updated}</strong>
                </div>
                <div className="bg-white p-2 rounded border border-border">
                  <span className="text-muted-foreground block">Falhas de gravação</span>
                  <strong className="text-base text-rose-600">{liveStats.failed}</strong>
                </div>
              </div>
            </div>
          )}

          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold text-xs text-secondary w-16">Linha</TableHead>
                  <TableHead className="font-bold text-xs text-secondary w-28">
                    SKU (Col 2)
                  </TableHead>
                  <TableHead className="font-bold text-xs text-secondary min-w-[280px]">
                    Descrição / Nome (Col 5)
                  </TableHead>
                  <TableHead className="font-bold text-xs text-secondary w-20">Unidade</TableHead>
                  <TableHead className="font-bold text-xs text-secondary w-36">
                    Categoria (Col 6)
                  </TableHead>
                  <TableHead className="font-bold text-xs text-secondary w-32">
                    Marca (Col 7)
                  </TableHead>
                  <TableHead className="font-bold text-xs text-primary bg-primary/5 text-right w-28">
                    Preço Venda (Público)
                  </TableHead>
                  <TableHead className="font-bold text-xs text-secondary text-right w-24">
                    Preço 1
                  </TableHead>
                  <TableHead className="font-bold text-xs text-secondary text-right w-24">
                    Preço 2
                  </TableHead>
                  <TableHead className="font-bold text-xs text-secondary text-right w-24">
                    Preço 3
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validRows.slice(0, 20).map((row) => (
                  <TableRow key={row.rawRowNumber} className="hover:bg-muted/10">
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {row.rawRowNumber}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      {row.sku}
                    </TableCell>
                    <TableCell className="font-semibold text-sm text-secondary">
                      {row.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.unit || '-'}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-secondary">
                      {row.category || '-'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.brand ? (
                        <Badge
                          variant="outline"
                          className="font-semibold text-[11px] border-secondary/30 text-secondary"
                        >
                          {row.brand}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-right font-bold text-primary bg-primary/5">
                      {row.price !== null ? (
                        formatCurrencyBRL(row.price)
                      ) : (
                        <span className="text-muted-foreground italic font-sans font-normal">
                          Consulte
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-right text-muted-foreground">
                      {row.price1 !== null ? formatCurrencyBRL(row.price1) : '-'}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-right text-muted-foreground">
                      {row.price2 !== null ? formatCurrencyBRL(row.price2) : '-'}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-right text-muted-foreground">
                      {row.price3 !== null ? formatCurrencyBRL(row.price3) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          <CardFooter className="p-4 bg-muted/10 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            <span>Visualizando primeiras 20 linhas de {validRows.length} detectadas</span>
            <Button
              onClick={handleStartImport}
              disabled={isImporting}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-sm shadow-sm"
            >
              Iniciar Importação
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Final Report Card */}
      {finalResult && (
        <Card className="border-border shadow-md rounded-sm bg-white border-t-4 border-t-emerald-500">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-extrabold text-secondary">
                  Importação Concluída com Sucesso!
                </CardTitle>
                <CardDescription>
                  Os dados foram processados e persistidos no banco de dados da BRM Mangueiras.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-2 space-y-6">
            {/* KPI summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted/30 p-4 rounded-sm border border-border text-center">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1">
                  Novos Cadastrados
                </span>
                <span className="text-3xl font-extrabold text-emerald-600 font-mono">
                  {finalResult.importedCount}
                </span>
              </div>
              <div className="bg-muted/30 p-4 rounded-sm border border-border text-center">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1">
                  Atualizados (Upsert)
                </span>
                <span className="text-3xl font-extrabold text-blue-600 font-mono">
                  {finalResult.updatedCount}
                </span>
              </div>
              <div className="bg-muted/30 p-4 rounded-sm border border-border text-center">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1">
                  Linhas Ignoradas
                </span>
                <span className="text-3xl font-extrabold text-amber-600 font-mono">
                  {finalResult.skippedCount}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  {[
                    skuExcluidoIgnoredCount > 0 ? `${skuExcluidoIgnoredCount} SKU excluído` : null,
                    conformeAmostraIgnoredCount > 0
                      ? `${conformeAmostraIgnoredCount} amostra`
                      : null,
                    eletrodieselIgnoredCount > 0
                      ? `${eletrodieselIgnoredCount} Eletrodiesel`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' / ') || 'Sem SKU/Nome'}
                </span>
              </div>
              <div className="bg-muted/30 p-4 rounded-sm border border-border text-center">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1">
                  Falhas de Gravação
                </span>
                <span className="text-3xl font-extrabold text-rose-600 font-mono">
                  {finalResult.failedCount}
                </span>
              </div>
            </div>

            {/* SKU Excluído, Conforme Amostra & Eletrodiesel breakdown notice */}
            {skuExcluidoIgnoredCount > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm text-amber-900">
                <h4 className="font-bold text-sm flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Produtos com SKU excluído permanentemente ignorados ({skuExcluidoIgnoredCount})
                </h4>
                <p className="text-xs text-amber-800">
                  {skuExcluidoIgnoredCount} linha(s) possuem SKU em lista de exclusão permanente
                  (como o SKU 2713). Conforme a regra de negócio do catálogo BR Mangueiras, esses
                  itens foram descartados e não são reimportados.
                </p>
              </div>
            )}

            {conformeAmostraIgnoredCount > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm text-amber-900">
                <h4 className="font-bold text-sm flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Itens personalizados "Conforme Amostra" ignorados ({conformeAmostraIgnoredCount})
                </h4>
                <p className="text-xs text-amber-800">
                  {conformeAmostraIgnoredCount} produto(s) continham o termo "conforme amostra" no
                  nome ou descrição. Conforme a regra de negócio, são itens sob encomenda vendidos
                  apenas no balcão físico e foram automaticamente excluídos do catálogo online.
                </p>
              </div>
            )}

            {eletrodieselIgnoredCount > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm text-amber-900">
                <h4 className="font-bold text-sm flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Mangueiras personalizáveis da marca "Eletrodiesel" ignoradas (
                  {eletrodieselIgnoredCount})
                </h4>
                <p className="text-xs text-amber-800">
                  {eletrodieselIgnoredCount} produto(s) pertencem à marca Eletrodiesel. Conforme a
                  regra de negócio, são mangueiras personalizáveis vendidas exclusivamente em loja
                  física e foram automaticamente excluídas do catálogo online.
                </p>
              </div>
            )}

            {/* Error listing if any */}
            {finalResult.errors.length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-sm">
                <h4 className="font-bold text-sm text-rose-800 flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" /> Detalhes das falhas (
                  {finalResult.errors.length}):
                </h4>
                <ul className="text-xs text-rose-700 space-y-1 max-h-40 overflow-y-auto">
                  {finalResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {finalResult.retriedBatchesCount && finalResult.retriedBatchesCount > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  O mecanismo de proteção contra taxa excedente reprocessou com sucesso{' '}
                  <strong>{finalResult.retriedBatchesCount}</strong> lote(s) que haviam atingido o
                  limite temporário da API.
                </span>
              </div>
            ) : null}

            <div className="p-4 bg-secondary/5 rounded-sm border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-primary" />
                <p className="text-sm text-secondary font-medium">
                  Os produtos agora estão disponíveis no catálogo geral e podem ser filtrados por
                  categoria e marca.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={resetAll}
                  className="rounded-sm font-bold border-border"
                >
                  Importar Outra Planilha
                </Button>
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-white rounded-sm font-bold shadow-sm"
                >
                  <Link to="/">
                    Ver Catálogo Atualizado <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation / Instructions card */}
      <Card className="border-border shadow-sm rounded-sm bg-white">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Orientações sobre a Planilha da BRM Mangueiras
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 text-xs text-muted-foreground space-y-2 leading-relaxed">
          <p>
            • <strong>Estrutura de colunas esperada:</strong> Col 1 (vazia/descartada), Col 2
            (SKU/Código), Col 3 (vazia), Col 4 (Unidade, ex: MT), Col 5 (Descrição do produto), Col
            6 (Categoria, ex: MANGUEIRA HIDRAULICA), Col 7 (Marca/Fabricante, ex: BALFLEX, KANAFLEX,
            CONTINENTAL), Col 8 (Preço Venda), Col 9 (Preço 2), Col 10 (Preço 3).
          </p>
          <p>
            • <strong>Exibição exclusiva de 'Preço Venda':</strong> Embora os três preços sejam
            armazenados para controle interno, <u>apenas o Preço Venda</u> é exibido no catálogo de
            vendas, carrinho de cotação e páginas de detalhe para os clientes.
          </p>
          <p>
            • <strong>Produtos sem preço:</strong> Se a coluna de Preço Venda estiver em branco para
            um item, o catálogo exibirá automaticamente a indicação "Consulte" ao invés de R$ 0,00.
          </p>
          <p>
            • <strong>Bloqueio permanente de SKU (ex.: SKU 2713):</strong> Linhas com SKUs marcados
            para exclusão definitiva são descartadas na importação e nunca reingressam no banco.
          </p>
          <p>
            • <strong>Filtro de itens "Conforme Amostra":</strong> Qualquer linha cujo nome ou
            descrição contenha o termo "conforme amostra" (em qualquer combinação de
            maiúsculas/minúsculas) é ignorada e não é cadastrada no catálogo, pois trata-se de
            fabricação personalizada da loja física.
          </p>
          <p>
            • <strong>Filtro de marca "Eletrodiesel":</strong> Mangueiras da marca Eletrodiesel (em
            qualquer combinação de maiúsculas/minúsculas) são ignoradas e não entram no catálogo,
            pois são personalizáveis e de venda exclusiva em loja física.
          </p>
          <p>
            • <strong>Upsert automático:</strong> Se um produto com o mesmo SKU já estiver no banco,
            seus dados (preços, marca, categoria, etc.) serão atualizados em vez de duplicados.
          </p>
          <p>
            • <strong>Proteção de limite de requisições:</strong> A gravação opera em lotes com
            pausa controlada e retentativa automática com backoff exponencial contra HTTP 429 ("Too
            Many Requests"), garantindo que todas as 380+ linhas sejam persistidas sem interrupção.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
