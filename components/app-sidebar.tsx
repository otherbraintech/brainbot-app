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
  ListChecks,
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

import { usePathname, useParams } from "next/navigation"
import packageJson from "@/package.json"

export function AppSidebar({
  user,
  projects = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User
  projects?: Project[]
}) {
  const pathname = usePathname()
  const params = useParams()
  const [activeProjectId, setActiveProjectId] = React.useState<string | null>(null)

  // Track active project from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("active_project")
      if (saved) {
        const parsed = JSON.parse(saved)
        setActiveProjectId(parsed?.id || null)
      }
    } catch {
      // ignore
    }

    // Listen for custom event when TeamSwitcher changes
    const handleProjectChange = () => {
      try {
        const saved = localStorage.getItem("active_project")
        if (saved) {
          const parsed = JSON.parse(saved)
          setActiveProjectId(parsed?.id || null)
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener("project-changed", handleProjectChange)
    return () => window.removeEventListener("project-changed", handleProjectChange)
  }, [])

  // Sync with URL params
  React.useEffect(() => {
    if (pathname.startsWith('/dashboard/projects/') && params.id) {
      const id = params.id as string
      if (id !== activeProjectId) {
        // Find the project name for storage
        const project = projects.find(p => p.id === id)
        const projectName = project?.name || "Proyecto"
        
        setActiveProjectId(id)
        try {
          localStorage.setItem("active_project", JSON.stringify({ id, name: projectName }))
          window.dispatchEvent(new Event("project-changed"))
        } catch (e) {
          // ignore
        }
      }
    }
  }, [pathname, params.id, activeProjectId, projects])


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

    // Órdenes del proyecto activo (si hay uno seleccionado)
    if (activeProjectId) {
      items = [
        ...items,
        {
          title: "Órdenes del Proyecto",
          url: `/dashboard/projects/${activeProjectId}`,
          icon: ListChecks,
        },
      ]
    }

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
  }, [activeProjectId])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2 group-data-[collapsible=icon]:px-2">
          <Bot className="h-6 w-6" />
          <span className="font-semibold group-data-[collapsible=icon]:hidden">OB Bot</span>
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
        <div className="px-4 py-2 flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-50 group-data-[collapsible=icon]:hidden">
            Versión {packageJson.version}
          </span>
          <NavUser user={user} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
