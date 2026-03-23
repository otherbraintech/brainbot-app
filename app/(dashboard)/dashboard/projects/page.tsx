import { getProjects } from "@/lib/actions/projects"
import { ProjectsList } from "@/components/projects/projects-list"
import { CreateProjectButton } from "@/components/projects/create-project-button"
import { RedirectToActiveProject } from "@/components/projects/redirect-to-active-project"
import { FolderKanban } from "lucide-react"

export default async function ProjectsPage() {
    const projects = await getProjects()

    return (
        <div className="space-y-4 relative pb-10 px-4 md:px-0 w-full -mt-2">
            <RedirectToActiveProject />
            
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Estrategias y Proyectos</h1>
                    <p className="text-muted-foreground text-sm">
                        Administra tus campañas de monitoreo y generación de contenido.
                    </p>
                </div>
                <CreateProjectButton />
            </div>

            <ProjectsList projects={projects} />
        </div>
    )
}
