import { getProjects } from "@/lib/actions/projects"
import { ProjectsList } from "@/components/projects/projects-list"
import { CreateProjectButton } from "@/components/projects/create-project-button"

export default async function ProjectsPage() {
    const projects = await getProjects()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Proyectos</h1>
                    <p className="text-muted-foreground">
                        Gestiona tus proyectos y organiza tus órdenes de comentarios.
                    </p>
                </div>
                <CreateProjectButton />
            </div>

            <ProjectsList projects={projects} />
        </div>
    )
}
