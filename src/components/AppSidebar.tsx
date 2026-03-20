import { Link, useLocation } from 'react-router-dom'
import { Layers, Package, Zap } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { categories } from '@/data/products'

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r border-slate-200 bg-white">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Navegação
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/' && !location.search}>
                  <Link to="/">
                    <Package />
                    <span>Todos os Produtos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.search.includes('featured')}>
                  <Link to="/?featured=true">
                    <Zap className="text-amber-500" />
                    <span>Destaques</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Categorias</SidebarGroupLabel>
          <SidebarGroupContent>
            <Accordion type="multiple" className="w-full">
              {categories.map((category, index) => (
                <AccordionItem value={`item-${index}`} key={category.name} className="border-none">
                  <AccordionTrigger className="px-4 py-2 hover:bg-slate-50 hover:no-underline rounded-md text-sm font-medium text-slate-700">
                    {category.name}
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <SidebarMenuSub>
                      {category.subcategories.map((sub) => {
                        const searchStr = `?category=${encodeURIComponent(category.name)}&sub=${encodeURIComponent(sub)}`
                        const isActive = location.search === searchStr
                        return (
                          <SidebarMenuSubItem key={sub}>
                            <SidebarMenuSubButton asChild isActive={isActive}>
                              <Link to={`/${searchStr}`}>{sub}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
