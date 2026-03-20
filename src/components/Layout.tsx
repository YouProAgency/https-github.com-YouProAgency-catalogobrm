import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import Header from './Header'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 w-full overflow-hidden bg-background">
          <Header />
          <main className="flex-1 overflow-x-hidden flex flex-col animate-fade-in">
            <Outlet />
          </main>
          <Footer />
        </SidebarInset>
      </div>
      <WhatsAppButton />
    </SidebarProvider>
  )
}
