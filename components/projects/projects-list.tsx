"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2, FolderOpen, RefreshCw} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
    assignTargetToProject,
    deleteProject,
    getBlockedTargetIds,
    updateProject,
} from "@/lib/actions/projects"
import { getUserTargets } from "@/lib/actions/targets"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Project = {
    id: string
    name: string
    createdAt: Date
    // New fields
    targetId?: string | null
    target?: {
        id: string
        name: string
        content: any
    } | null
    stance?: "FAVOR" | "AGAINST"
    autoOrdersEnabled: boolean
    urlFacebook?: string | null
    urlInstagram?: string | null
    urlTiktok?: string | null

    _count: {
        botOrders: number
        genComments: number
    }
}

export function ProjectsList({ projects }: { projects: Project[] }) {
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [deletingProject, setDeletingProject] = useState<Project | null>(null)
    const [editName, setEditName] = useState("")
    const [userTargets, setUserTargets] = useState<Array<{ id: string; name: string }>>([])
    const [editTargetId, setEditTargetId] = useState<string>("")
    const [editStance, setEditStance] = useState<"FAVOR" | "AGAINST">("FAVOR")
    const [editAutoOrdersEnabled, setEditAutoOrdersEnabled] = useState(false)
    const [editUrlFacebook, setEditUrlFacebook] = useState("")
    const [editUrlInstagram, setEditUrlInstagram] = useState("")
    const [editUrlTiktok, setEditUrlTiktok] = useState("")
    const [targetsLoading, setTargetsLoading] = useState(false)
    const [blockedTargetIds, setBlockedTargetIds] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function loadTargets(nextTargetIdAfterLoad: string) {
        setTargetsLoading(true)
        // Force the select to show a visible loading state in the trigger
        setEditTargetId("__loading")
        try {
            const [targets, blocked] = await Promise.all([getUserTargets(), getBlockedTargetIds()])
            setUserTargets((targets as any)?.map((t: any) => ({ id: t.id, name: t.name })) ?? [])
            setBlockedTargetIds((blocked as any) ?? [])
        } catch {
            setUserTargets([])
            setBlockedTargetIds([])
        } finally {
            setTargetsLoading(false)
            setEditTargetId(nextTargetIdAfterLoad)
        }
    }

    async function handleEdit() {
        if (!editingProject) return
        setLoading(true)
        setError(null)

        const result = await updateProject(editingProject.id, editName, {
            autoOrdersEnabled: editAutoOrdersEnabled,
            urlFacebook: editUrlFacebook || null,
            urlInstagram: editUrlInstagram || null,
            urlTiktok: editUrlTiktok || null
        })

        if (!result.error && editTargetId && editTargetId !== "__none") {
            const assignResult = await assignTargetToProject(editingProject.id, editTargetId, editStance)
            if (assignResult.error) {
                setError(assignResult.error)
                setLoading(false)
                return
            }
        }

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
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="border-border bg-muted/30">
                                        {project.target?.name ? project.target.name : "Sin objetivo"}
                                    </Badge>
                                    {project.stance && (
                                        <Badge
                                            className={
                                                project.stance === "AGAINST"
                                                    ? "bg-red-600 text-white hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-500"
                                                    : "bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-500"
                                            }
                                        >
                                            {project.stance === "AGAINST" ? "En Contra" : "A Favor"}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {project.autoOrdersEnabled && (
                                    <div className="flex items-center justify-center p-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800 shadow-sm" title="Monitoreo Automático Activo">
                                        <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                                    </div>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setEditingProject(project)
                                                setEditName(project.name)
                                                setEditStance(project.stance || "FAVOR")
                                                setEditAutoOrdersEnabled(project.autoOrdersEnabled)
                                                setEditUrlFacebook(project.urlFacebook || "")
                                                setEditUrlInstagram(project.urlInstagram || "")
                                                setEditUrlTiktok(project.urlTiktok || "")
                                                loadTargets(project.targetId || "__none")
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
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full border-border bg-background hover:bg-muted shadow-xs"
                                onClick={() => {
                                    // Update TeamSwitcher when clicking on project
                                    try {
                                        localStorage.setItem("active_project", JSON.stringify({
                                            id: project.id,
                                            name: project.name
                                        }))
                                        window.dispatchEvent(new Event("project-changed"))
                                    } catch {
                                        // ignore
                                    }
                                }}
                            >
                                <Link href={`/dashboard/projects/${project.id}`}>
                                    Ver Proyecto
                                </Link>
                            </Button>
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
                            Cambia el nombre, objetivo y postura del proyecto.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {error && (
                            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input
                                    placeholder="Nombre del proyecto"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    minLength={2}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Objetivo</Label>
                                <Select value={editTargetId} onValueChange={setEditTargetId}>
                                    <SelectTrigger disabled={targetsLoading}>
                                        <SelectValue placeholder={targetsLoading ? "Cargando..." : "Seleccionar..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {targetsLoading ? (
                                            <SelectItem value="__loading" disabled>
                                                Cargando...
                                            </SelectItem>
                                        ) : userTargets.length === 0 ? (
                                            <SelectItem value="__empty" disabled>
                                                No tienes objetivos
                                            </SelectItem>
                                        ) : (
                                            <>
                                                <SelectItem value="__none">Sin objetivo</SelectItem>
                                                {userTargets.map((t) => {
                                                    const isBlocked = blockedTargetIds.includes(t.id)
                                                    const isCurrent = t.id === (editingProject?.targetId || "")
                                                    const disabled = isBlocked && !isCurrent
                                                    return (
                                                        <SelectItem key={t.id} value={t.id} disabled={disabled}>
                                                            {t.name}{disabled ? " (No disponible)" : ""}
                                                        </SelectItem>
                                                    )
                                                })}
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between rounded-md border bg-muted/20 p-3">
                                <div className="space-y-0.5">
                                    <Label className="text-sm">Postura</Label>
                                    <p className="text-xs text-muted-foreground">A favor / En contra</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-xs font-semibold ${editStance === "AGAINST"
                                                ? "text-muted-foreground"
                                                : "text-emerald-600 dark:text-emerald-400"
                                            }`}
                                    >
                                        A Favor
                                    </span>
                                    <Switch
                                        checked={editStance === "AGAINST"}
                                        onCheckedChange={(checked) => setEditStance(checked ? "AGAINST" : "FAVOR")}
                                        className="data-[state=unchecked]:bg-emerald-600 data-[state=unchecked]:dark:bg-emerald-500 data-[state=checked]:bg-red-600 data-[state=checked]:dark:bg-red-500"
                                    />
                                    <span
                                        className={`text-xs font-semibold ${editStance === "AGAINST"
                                                ? "text-red-600 dark:text-red-400"
                                                : "text-muted-foreground"
                                            }`}
                                    >
                                        En Contra
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t pt-4">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Órdenes Automáticas</Label>
                                    <p className="text-[10px] text-muted-foreground">Monitoreo automático de redes sociales.</p>
                                </div>
                                <Switch
                                    checked={editAutoOrdersEnabled}
                                    onCheckedChange={setEditAutoOrdersEnabled}
                                />
                            </div>

                            {editAutoOrdersEnabled && (
                                <div className="grid gap-3 animate-in fade-in slide-in-from-top-2 duration-300 bg-muted/30 p-3 rounded-md border">
                                    <div className="grid gap-1">
                                        <Label htmlFor="edit-fb" className="text-[10px] uppercase font-bold text-muted-foreground">Facebook URL</Label>
                                        <Input
                                            id="edit-fb"
                                            placeholder="https://facebook.com/..."
                                            value={editUrlFacebook}
                                            onChange={(e) => setEditUrlFacebook(e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <Label htmlFor="edit-ig" className="text-[10px] uppercase font-bold text-muted-foreground">Instagram URL</Label>
                                        <Input
                                            id="edit-ig"
                                            placeholder="https://instagram.com/..."
                                            value={editUrlInstagram}
                                            onChange={(e) => setEditUrlInstagram(e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <Label htmlFor="edit-tk" className="text-[10px] uppercase font-bold text-muted-foreground">TikTok URL</Label>
                                        <Input
                                            id="edit-tk"
                                            placeholder="https://tiktok.com/@..."
                                            value={editUrlTiktok}
                                            onChange={(e) => setEditUrlTiktok(e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" className="border-border" onClick={() => setEditingProject(null)}>
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
