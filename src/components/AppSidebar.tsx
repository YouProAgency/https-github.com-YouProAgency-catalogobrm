import { Link, useLocation } from 'react-router-dom'
import { Wrench, Package, Zap } from 'lucide-react'

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
    <Sidebar className="border-r border-border bg-white shadow-sm">
      <SidebarHeader className="h-[72px] flex items-center px-4 border-b border-border bg-secondary">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-white">
          <Wrench className="h-4 w-4 text-primary" />
          Navegação
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-bold text-muted-foreground">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/' && !location.search}>
                  <Link to="/">
                    <Package />
                    <span className="font-semibold">Todos os Produtos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.search.includes('featured')}>
                  <Link to="/?featured=true">
                    <Zap className="text-primary" />
                    <span className="font-semibold">Destaques</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-bold text-muted-foreground">
            Categorias
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Accordion type="multiple" className="w-full">
              {categories.map((category, index) => (
                <AccordionItem value={`item-${index}`} key={category.name} className="border-none">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline rounded-sm text-sm font-bold text-secondary">
                    {category.name}
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <SidebarMenuSub>
                      {category.subcategories.map((sub) => {
                        const searchStr = `?category=${encodeURIComponent(category.name)}&sub=${encodeURIComponent(sub)}`
                        const isActive = location.search === searchStr
                        return (
                          <SidebarMenuSubItem key={sub}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive}
                              className="font-medium"
                            >
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
