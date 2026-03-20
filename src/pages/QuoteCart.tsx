import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, Plus, Minus, ArrowLeft, CheckCircle2, FileText } from 'lucide-react'

import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  email: z.string().email('Email inválido.'),
  company: z.string().min(2, 'Nome da empresa é obrigatório.'),
  phone: z.string().min(10, 'Telefone inválido.'),
  message: z.string().optional(),
})

export default function QuoteCart() {
  const { items, updateQuantity, removeFromCart, clearCart, totalItems } = useCart()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      phone: '',
      message: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Quote Request Submitted', { user: values, items })
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true)
      clearCart()
      window.scrollTo(0, 0)
    }, 800)
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <Card className="border-emerald-100 shadow-lg text-center p-8">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Orçamento Solicitado!</h2>
          <p className="text-slate-600 mb-8 text-lg">
            Sua solicitação foi enviada com sucesso para nossa equipe comercial. Entraremos em
            contato em breve através do email fornecido.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <FileText className="h-4 w-4" /> Baixar Resumo (PDF)
            </Button>
            <Button asChild>
              <Link to="/">Continuar Navegando</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Seu Carrinho está Vazio</h2>
        <p className="text-slate-500 mb-8">
          Adicione produtos ao seu carrinho de orçamentos para solicitar uma cotação formal.
        </p>
        <Button size="lg" asChild>
          <Link to="/">Explorar Produtos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Solicitação de Orçamento</h1>
          <p className="text-slate-500">
            Revise os {totalItems} itens selecionados e preencha seus dados.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg flex justify-between">
                <span>Produtos Selecionados</span>
                <span className="text-muted-foreground text-sm font-normal">
                  {items.length} tipo(s)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center bg-white transition-colors hover:bg-slate-50/50"
                >
                  <div className="h-20 w-20 shrink-0 rounded-md border border-slate-200 bg-white p-1">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-semibold text-slate-900 line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-slate-500 mb-2 font-mono">{item.product.sku}</p>

                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                      <div className="flex items-center border border-slate-200 rounded-md bg-white">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 rounded-none rounded-l-md hover:bg-slate-100"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 rounded-none rounded-r-md hover:bg-slate-100"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between">
              <span className="font-medium text-slate-700">Total de unidades:</span>
              <span className="font-bold text-lg">{totalItems}</span>
            </CardFooter>
          </Card>
        </div>

        {/* User Form */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <Card className="border-slate-200 shadow-elevation">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Dados da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa (Razão Social)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Sua Empresa LTDA"
                            {...field}
                            className="bg-slate-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Contato</FormLabel>
                        <FormControl>
                          <Input placeholder="João Silva" {...field} className="bg-slate-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail Corporativo</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="contato@empresa.com"
                              {...field}
                              className="bg-slate-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone / WhatsApp</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(00) 00000-0000"
                              {...field}
                              className="bg-slate-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações Adicionais (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Preciso de cotação com frete para São Paulo..."
                            className="resize-none bg-slate-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-6" />

                  <Button
                    type="submit"
                    className="w-full text-lg h-12 shadow-md hover:shadow-lg transition-all"
                  >
                    Enviar Solicitação
                  </Button>
                  <p className="text-xs text-center text-slate-500 mt-4">
                    Ao enviar, você concorda com nossos termos de privacidade e tratamento de dados
                    para fins comerciais.
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
