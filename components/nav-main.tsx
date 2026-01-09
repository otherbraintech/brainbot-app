"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}

const COLLAPSED_KEY_PREFIX = "sidebar_nav_"

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  // Start with empty state, load from localStorage after mount
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({})
  const [hasMounted, setHasMounted] = useState(false)

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const states: Record<string, boolean> = {}
    items.forEach(item => {
      if (item.items && item.items.length > 0) {
        const saved = localStorage.getItem(COLLAPSED_KEY_PREFIX + item.title)
        states[item.title] = saved === null ? true : saved === "true"
      }
    })
    setOpenStates(states)
    setHasMounted(true)
  }, [items])

  // Persist to localStorage when state changes (only after mount)
  useEffect(() => {
    if (!hasMounted) return
    Object.entries(openStates).forEach(([key, value]) => {
      localStorage.setItem(COLLAPSED_KEY_PREFIX + key, String(value))
    })
  }, [openStates, hasMounted])

  const toggleOpen = (title: string) => {
    setOpenStates(prev => ({ ...prev, [title]: !prev[title] }))
  }

  // Use true as default until localStorage loads
  const getIsOpen = (title: string) => openStates[title] ?? true

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navegación</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Item without sub-items - simple link
          if (!item.items || item.items.length === 0) {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild isActive={isActive}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // Item with sub-items - collapsible
          const isParentActive = pathname.startsWith(item.url)

          return (
            <Collapsible
              key={item.title}
              open={getIsOpen(item.title)}
              onOpenChange={() => toggleOpen(item.title)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={isParentActive}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const isSubActive = pathname === subItem.url
                      return (
                        <SidebarMenuSubItem key={subItem.url}>
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
                            <Link href={subItem.url} className="flex items-center gap-2">
                              {subItem.icon && <subItem.icon className="h-4 w-4" />}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
