import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import ProductDetails from './pages/ProductDetails'
import QuoteCart from './pages/QuoteCart'
import AdminImport from './pages/AdminImport'
import AdminLogin from './pages/AdminLogin'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/produto/:id" element={<ProductDetails />} />
              <Route path="/orcamento" element={<QuoteCart />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/importar"
                element={
                  <ProtectedRoute>
                    <AdminImport />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
