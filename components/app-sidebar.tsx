"use client"

import * as React from "react"
import {
  Bot,
  FolderOpen,
  LayoutDashboard,
  Plus,
  Smartphone,
  Users,
} from "lucide-react"

import { NavMain, type NavItem } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
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

export function AppSidebar({
  user,
  projects = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User
  projects?: Project[]
}) {

  // Build navigation items dynamically
  const navItems: NavItem[] = React.useMemo(() => {
    const items: NavItem[] = [
      {
        title: "Panel de Control",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ]

    // Proyectos section
    if (projects && projects.length > 0) {
      items.push({
        title: "Proyectos",
        url: "/dashboard/projects",
        icon: FolderOpen,
        items: [
          ...projects.map((project) => ({
            title: project.name,
            url: `/dashboard/projects/${project.id}`,
          })),
          {
            title: "Nuevo proyecto",
            url: "/dashboard/projects",
            icon: Plus,
          },
        ],
      })
    } else {
      items.push({
        title: "Nuevo proyecto",
        url: "/dashboard/projects",
        icon: Plus,
      })
    }

    // Dispositivos - simple link
    items.push({
      title: "Dispositivos",
      url: "/dashboard/devices",
      icon: Smartphone,
    })

    // Usuarios - simple link
    items.push({
      title: "Usuarios",
      url: "/dashboard/users",
      icon: Users,
    })

    return items
  }, [projects])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Bot className="h-6 w-6" />
          <span className="font-semibold">Brain Bot</span>
        </div>
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
