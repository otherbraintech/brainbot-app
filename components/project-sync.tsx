"use client"

import { useEffect } from "react"

interface ProjectSyncProps {
  projectId?: string | null
  projectName?: string | null
}

export function ProjectSync({ projectId, projectName }: ProjectSyncProps) {
  useEffect(() => {
    if (!projectId || !projectName) return
    
    try {
      const saved = localStorage.getItem("active_project")
      const parsed = saved ? JSON.parse(saved) : null
      
      if (parsed?.id !== projectId) {
        localStorage.setItem("active_project", JSON.stringify({ id: projectId, name: projectName }))
        window.dispatchEvent(new Event("project-changed"))
      }
    } catch {
      // ignore
    }
  }, [projectId, projectName])
  
  return null
}
