import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 w-full overflow-hidden bg-slate-50">
          <Header />
          <main className="flex-1 overflow-y-auto animate-fade-in">
            <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl">
              <Outlet />
            </div>
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
