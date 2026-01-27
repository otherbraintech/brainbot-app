"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    id?: string
    name: string
    logo: React.ElementType
    plan: string
    url?: string
    stance?: "FAVOR" | "AGAINST"
  }[]
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("active_project")
      if (!saved) return
      const parsed = (globalThis as any).JSON.parse(saved)
      const found = (teams as any).find((t: any) => t.id && t.id === parsed?.id)
      if (found) setActiveTeam(found)
    } catch {
      // ignore
    }
  }, [teams])

  // Listen for project changes from other components
  React.useEffect(() => {
    const handleProjectChange = () => {
      try {
        const saved = localStorage.getItem("active_project")
        if (!saved) return
        const parsed = JSON.parse(saved)
        const found = teams.find((t: any) => t.id && t.id === parsed?.id)
        if (found) setActiveTeam(found)
      } catch {
        // ignore
      }
    }

    window.addEventListener("project-changed", handleProjectChange)
    return () => window.removeEventListener("project-changed", handleProjectChange)
  }, [teams])

  React.useEffect(() => {
    if (!activeTeam?.id) return
    try {
      localStorage.setItem("active_project", JSON.stringify({ id: activeTeam.id, name: activeTeam.name }))
      // Dispatch custom event to notify AppSidebar
      window.dispatchEvent(new Event("project-changed"))
    } catch {
      // ignore
    }
  }, [activeTeam])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger {...({ asChild: true } as any)}>
            <SidebarMenuButton
              size="default"
              tooltip={activeTeam.name}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg group-data-[collapsible=icon]:mx-auto">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{activeTeam.name}</span>
                  {activeTeam.stance && (
                    <Badge
                      variant={activeTeam.stance === "AGAINST" ? "destructive" : "default"}
                      className={`h-4 px-1.5 text-[9px] ${activeTeam.stance === "AGAINST"
                        ? "bg-red-600 hover:bg-red-600 dark:bg-red-500"
                        : "bg-emerald-600 hover:bg-emerald-600 dark:bg-emerald-500"
                        }`}
                    >
                      {activeTeam.stance === "AGAINST" ? "Contra" : "Favor"}
                    </Badge>
                  )}
                </div>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs" {...({} as any)}>
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => {
                  setActiveTeam(team)
                  if (team.url) router.push(team.url)
                }}
                className="gap-2 p-2"
                {...({} as any)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <team.logo className="size-3.5 shrink-0" />
                </div>
                {team.name}
                {team.stance && (
                  <Badge
                    variant={team.stance === "AGAINST" ? "destructive" : "default"}
                    className={`ml-auto h-4 px-1 text-[9px] ${team.stance === "AGAINST"
                      ? "bg-red-600 hover:bg-red-600 dark:bg-red-500"
                      : "bg-emerald-600 hover:bg-emerald-600 dark:bg-emerald-500"
                      }`}
                  >
                    {team.stance === "AGAINST" ? "Contra" : "Favor"}
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => router.push("/dashboard/projects?list=1")}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Nuevo proyecto</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
