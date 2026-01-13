import { getProjects } from "@/lib/actions/projects"
import { ProjectsList } from "@/components/projects/projects-list"
import { CreateProjectButton } from "@/components/projects/create-project-button"
import { RedirectToActiveProject } from "@/components/projects/redirect-to-active-project"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ProjectsPage() {
    const projects = await getProjects()

    return (
        <div className="space-y-6">
            <RedirectToActiveProject />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Proyectos</h1>
                        <p className="text-muted-foreground">
                            Gestiona tus proyectos y organiza tus órdenes de comentarios.
                        </p>
                    </div>
                </div>
                <CreateProjectButton />
            </div>

            <ProjectsList projects={projects} />
        </div>
    )
}
