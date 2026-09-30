import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import ProductDetails from './pages/ProductDetails'
import QuoteCart from './pages/QuoteCart'
import AdminImport from './pages/AdminImport'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { CartProvider } from './context/CartContext'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/produto/:id" element={<ProductDetails />} />
            <Route path="/orcamento" element={<QuoteCart />} />
            <Route path="/admin/importar" element={<AdminImport />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CartProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
