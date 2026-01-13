"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2, FolderOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { updateProject, deleteProject } from "@/lib/actions/projects"
import { CreateTargetButton } from "./create-target-button"

type Project = {
    id: string
    name: string
    createdAt: Date
    _count: {
        botOrders: number
        genComments: number
    }
}

export function ProjectsList({ projects }: { projects: Project[] }) {
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [deletingProject, setDeletingProject] = useState<Project | null>(null)
    const [editName, setEditName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleEdit() {
        if (!editingProject) return
        setLoading(true)
        setError(null)

        const result = await updateProject(editingProject.id, editName)

        if (result.error) {
            setError(result.error)
        } else {
            setEditingProject(null)
        }
        setLoading(false)
    }

    async function handleDelete() {
        if (!deletingProject) return
        setLoading(true)
        setError(null)

        const result = await deleteProject(deletingProject.id)

        if (result.error) {
            setError(result.error)
        } else {
            setDeletingProject(null)
        }
        setLoading(false)
    }

    if (projects.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No tienes proyectos</h3>
                    <p className="text-muted-foreground text-center mt-1">
                        Crea tu primer proyecto para comenzar a generar comentarios.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <Card key={project.id}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                            <div>
                                <CardTitle className="text-lg">{project.name}</CardTitle>
                                <CardDescription>
                                    {project._count.botOrders} órdenes
                                </CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="icon" className="h-8 w-8 border-slate-200 shadow-sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setEditingProject(project)
                                            setEditName(project.name)
                                        }}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => setDeletingProject(project)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button asChild variant="secondary" className="w-full border-slate-200 shadow-sm">
                                <Link href={`/dashboard/projects/${project.id}`}>
                                    Ver Proyecto
                                </Link>
                            </Button>
                            <CreateTargetButton project={project} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Proyecto</DialogTitle>
                        <DialogDescription>
                            Cambia el nombre del proyecto.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {error && (
                            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}
                        <Input
                            placeholder="Nombre del proyecto"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            minLength={2}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" className="border-slate-200" onClick={() => setEditingProject(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleEdit} disabled={loading}>
                            {loading ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingProject} onOpenChange={() => setDeletingProject(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de eliminar el proyecto <span className="font-semibold">&quot;{deletingProject?.name}&quot;</span>.
                            <br /><br />
                            Esto eliminará también <span className="font-bold text-red-600 dark:text-red-400">{deletingProject?._count.botOrders} órdenes</span> asociadas y todos sus contenidos.
                            <br /><br />
                            Esta acción es permanente y no se puede deshacer. ¿Seguro que quieres continuar?
                            {error && (
                                <span className="block mt-2 text-red-600 font-medium">{error}</span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
