import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redireciona para onde o usuário tentou acessar ou para /admin/importar por padrão
  const from = (location.state as any)?.from?.pathname || '/admin/importar'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Se já estiver autenticado, redireciona diretamente
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail administrativo.')
      return
    }

    if (!password) {
      setErrorMessage('Por favor, digite sua senha de acesso.')
      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      console.error('Falha na autenticação:', err)
      // Mensagem clara e amigável em português
      if (err?.status === 400 || err?.message?.includes('Failed to authenticate')) {
        setErrorMessage('E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.')
      } else {
        setErrorMessage(
          err?.message || 'Não foi possível conectar ao servidor. Tente novamente em instantes.',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Detalhes visuais no padrão BRM Mangueiras (#1B365D marinho e #D92525 vermelho) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary" />
      <div className="absolute top-1.5 left-0 right-0 h-1.5 bg-primary" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
          <img
            src="/logo.png"
            alt="BR Mangueiras"
            className="h-16 w-auto mx-auto object-contain drop-shadow-sm"
          />
        </Link>
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Painel de Gestão</span>
        </div>
        <h2 className="mt-3 text-2xl font-black text-secondary tracking-tight">
          Acesso Administrativo
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Entre com sua conta autorizada para gerenciar o catálogo e importar planilhas.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-border shadow-md rounded-sm bg-white">
          <CardHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
            <CardTitle className="text-base font-bold text-secondary flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Identificação do Administrador
            </CardTitle>
            <CardDescription className="text-xs">
              Informe suas credenciais de administrador da BR Mangueiras.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-4">
              {errorMessage && (
                <Alert
                  variant="destructive"
                  className="rounded-sm py-2 px-3 border-red-200 bg-red-50 text-red-900"
                >
                  <AlertCircle className="h-4 w-4 text-primary shrink-0" />
                  <AlertDescription className="text-xs font-medium">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs font-bold text-secondary uppercase">
                  E-mail Administrativo
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@brmangueiras.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 rounded-sm focus-visible:ring-primary focus-visible:border-primary h-10 text-sm"
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="admin-password"
                    className="text-xs font-bold text-secondary uppercase"
                  >
                    Senha de Acesso
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 rounded-sm focus-visible:ring-primary focus-visible:border-primary h-10 text-sm"
                    autoComplete="current-password"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-6 pt-2 flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-sm shadow-sm gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verificando credenciais...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Painel</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/"
                  className="text-xs text-muted-foreground hover:text-secondary transition-colors underline-offset-4 hover:underline"
                >
                  &larr; Voltar ao catálogo público
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
