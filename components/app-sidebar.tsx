"use client"

import * as React from "react"
import {
  Bot,
  FolderOpen,
  History,
  LayoutDashboard,
  Smartphone,
  Users,
  Target,
} from "lucide-react"

import { NavMain, type NavItem } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

type Project = {
  id: string
  name: string
}

type User = {
  name: string
  username: string
} | null

import { usePathname } from "next/navigation"

export function AppSidebar({
  user,
  projects = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User
  projects?: Project[]
}) {
  const pathname = usePathname()


  // Default to first project if still null after effect (client-side) or handle server-side default



  const teams = React.useMemo(
    () =>
      ((projects as any) || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        logo: FolderOpen,
        plan: "Proyecto",
        url: `/dashboard/projects/${p.id}`,
        stance: p.stance,
      })),
    [projects]
  )

  // Build navigation items dynamically
  const navItems: NavItem[] = React.useMemo(() => {
    let items: any[] = [
      {
        title: "Panel de Control",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ]

    // Proyectos
    items = [
      ...items,
      {
        title: "Proyectos",
        url: "/dashboard/projects?list=1",
        icon: FolderOpen,
      },
    ]

    // Objetivos
    items = [
      ...items,
      {
        title: "Objetivos",
        url: "/dashboard/targets",
        icon: Target,
      },
    ]

    // Dispositivos - simple link
    items = [
      ...items,
      {
        title: "Dispositivos",
        url: "/dashboard/devices",
        icon: Smartphone,
      }
    ]

    // Usuarios - simple link
    items = [
      ...items,
      {
        title: "Usuarios",
        url: "/dashboard/users",
        icon: Users,
      }
    ]

    // Historial - simple link
    items = [
      ...items,
      {
        title: "Historial de Órdenes",
        url: "/dashboard/orders/history",
        icon: History,
      }
    ]

    return items
  }, [projects])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2 group-data-[collapsible=icon]:px-2">
          <Bot className="h-6 w-6" />
          <span className="font-semibold group-data-[collapsible=icon]:hidden">Brain Bot</span>
        </div>
        {teams.length > 0 && (
          <div>
            <TeamSwitcher teams={teams} />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
