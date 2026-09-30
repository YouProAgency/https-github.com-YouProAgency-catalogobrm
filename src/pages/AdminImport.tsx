import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
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
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { ParsedProductRow, upsertProductBatch, ImportResult } from '@/services/products'

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

export default function AdminImport() {
  const [fileName, setFileName] = useState<string>('')
  const [fileSize, setFileSize] = useState<string>('')
  const [rawRowsCount, setRawRowsCount] = useState<number>(0)
  const [validRows, setValidRows] = useState<ParsedProductRow[]>([])
  const [ignoredRowsCount, setIgnoredRowsCount] = useState<number>(0)
  const [isParsing, setIsParsing] = useState<boolean>(false)

  const [isImporting, setIsImporting] = useState<boolean>(false)
  const [progressPercent, setProgressPercent] = useState<number>(0)
  const [processedCount, setProcessedCount] = useState<number>(0)
  const [liveStats, setLiveStats] = useState({ imported: 0, updated: 0, failed: 0 })
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
      let ignored = 0

      // The spreadsheet has NO header row: row 0 is already product data.
      // Column index mapping (0-based):
      // col 0: empty/ignorable
      // col 1: SKU (code)
      // col 2: empty
      // col 3: unit (e.g. "MT")
      // col 4: name/description
      // col 5: category
      // col 6: brand (e.g. BALFLEX, KANAFLEX, etc.)
      // col 7: price 1
      // col 8: price 2
      // col 9: price 3
      // col 10 & 11: ignorable

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        if (!row || !Array.isArray(row) || row.length === 0) {
          ignored++
          continue
        }

        const rawSku = row[1] !== undefined ? String(row[1]).trim() : ''
        const rawName = row[4] !== undefined ? String(row[4]).trim() : ''

        // Discard row if missing mandatory SKU or product Name
        if (!rawSku || !rawName) {
          ignored++
          continue
        }

        const rawUnit = row[3] !== undefined ? String(row[3]).trim() : ''
        const rawCategory = row[5] !== undefined ? String(row[5]).trim() : ''
        const rawBrand = row[6] !== undefined ? String(row[6]).trim() : ''

        const price1 = parsePrice(row[7])
        const price2 = parsePrice(row[8])
        const price3 = parsePrice(row[9])

        parsed.push({
          sku: rawSku,
          name: rawName,
          unit: rawUnit,
          category: rawCategory,
          brand: rawBrand,
          price1,
          price2,
          price3,
          rawRowNumber: i + 1,
        })
      }

      setValidRows(parsed)
      setIgnoredRowsCount(ignored)
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
    setLiveStats({ imported: 0, updated: 0, failed: 0 })
    setFinalResult(null)

    try {
      const result = await upsertProductBatch(validRows, (processed, total, stats) => {
        setProcessedCount(processed)
        setProgressPercent(Math.round((processed / total) * 100))
        setLiveStats(stats)
      })

      result.skippedCount = ignoredRowsCount
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
    setValidRows([])
    setIgnoredRowsCount(0)
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

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="rounded-sm font-bold border-border">
            <Link to="/">Ver Catálogo Público</Link>
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
            A detecção automática lê a planilha sem linha de cabeçalho: código SKU na coluna 2,
            unidade na coluna 4, descrição/nome na coluna 5, categoria na coluna 6, marca na coluna
            7 e preços nas colunas 8, 9 e 10.
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
                <div>
                  <h4 className="font-bold text-secondary text-base">{fileName}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>Tamanho: {fileSize}</span>
                    <span>•</span>
                    <span>Total de linhas no arquivo: {rawRowsCount}</span>
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
                prontos para gravação.
                {ignoredRowsCount > 0 && (
                  <span className="text-amber-600 block sm:inline sm:ml-2">
                    ({ignoredRowsCount} linhas ignoradas por ausência de SKU ou Nome).
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
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  Gravando produtos na coleção 'products'... ({processedCount} de {validRows.length}
                  )
                </span>
                <span className="text-primary font-mono">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-3 rounded-full" />
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
                    <TableCell className="text-xs font-mono text-right font-medium">
                      {row.price1 !== null ? `R$ ${row.price1.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-right text-muted-foreground">
                      {row.price2 !== null ? `R$ ${row.price2.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-right text-muted-foreground">
                      {row.price3 !== null ? `R$ ${row.price3.toFixed(2)}` : '-'}
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
                <span className="text-[10px] text-muted-foreground block mt-0.5">Sem SKU/Nome</span>
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
            CONTINENTAL), Col 8 (Preço 1), Col 9 (Preço 2), Col 10 (Preço 3).
          </p>
          <p>
            • <strong>Upsert automático:</strong> Se um produto com o mesmo SKU já estiver no banco,
            seus dados (preços, marca, categoria, etc.) serão atualizados em vez de duplicados.
          </p>
          <p>
            • <strong>Fotos e descrições:</strong> Produtos recém-importados ficam com imagens e
            descrição estendida em branco até que sejam complementados posteriormente.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
