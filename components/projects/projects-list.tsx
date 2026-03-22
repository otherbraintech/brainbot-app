"use client"

import { useState, useMemo } from "react"
import { Target, Hash, MessageSquare, MoreHorizontal, Pencil, Trash2, Eye, ExternalLink, Activity, Search, X, FolderOpen } from "lucide-react"
import { TikTokIcon } from "@/components/icons/tiktok-icon"
import { Facebook, Instagram } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
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
    targetId?: string | null
    target?: {
        id: string
        name: string
        content: any
        imageBase64?: string | null
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
    const [viewingProject, setViewingProject] = useState<Project | null>(null)
    const [deletingProject, setDeletingProject] = useState<Project | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
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
    const [searchQuery, setSearchQuery] = useState("")
    const [stanceFilter, setStanceFilter] = useState<"ALL" | "FAVOR" | "AGAINST">("ALL")

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 p.target?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStance = stanceFilter === "ALL" || p.stance === stanceFilter
            return matchesSearch && matchesStance
        })
    }, [projects, searchQuery, stanceFilter])

    async function loadTargets(nextTargetIdAfterLoad: string) {
        setTargetsLoading(true)
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
            <Card className="border-dashed p-10 text-center bg-muted/20">
                <div className="flex flex-col items-center gap-2">
                    <FolderOpen className="h-10 w-10 text-muted-foreground opacity-30" />
                    <h3 className="text-lg font-medium">No hay proyectos activos</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">Crea tu primera estrategia para comenzar a operar.</p>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Filtrar por nombre..." 
                        className="pl-9 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-lg border">
                    <Button 
                        variant={stanceFilter === "ALL" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 text-xs px-3"
                        onClick={() => setStanceFilter("ALL")}
                    >
                        Todos
                    </Button>
                    <Button 
                        variant={stanceFilter === "FAVOR" ? "secondary" : "ghost"}
                        size="sm"
                        className={`h-7 text-xs px-3 ${stanceFilter === 'FAVOR' ? 'text-emerald-600 bg-emerald-50' : ''}`}
                        onClick={() => setStanceFilter("FAVOR")}
                    >
                        Favor
                    </Button>
                    <Button 
                        variant={stanceFilter === "AGAINST" ? "secondary" : "ghost"}
                        size="sm"
                        className={`h-7 text-xs px-3 ${stanceFilter === 'AGAINST' ? 'text-red-600 bg-red-50' : ''}`}
                        onClick={() => setStanceFilter("AGAINST")}
                    >
                        Contra
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                    <Card key={project.id} className="relative overflow-hidden group flex flex-col h-full shadow-xs hover:shadow-md transition-all">
                        <div className={`absolute top-0 inset-x-0 h-1 z-20 ${project.stance === 'AGAINST' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        
                        <CardHeader className="pb-3 border-b bg-muted/10">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className={`h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 overflow-hidden border border-border/50 ${project.target?.imageBase64 ? 'cursor-pointer transition-all hover:ring-2 hover:ring-emerald-400' : ''}`}
                                            onClick={() => project.target?.imageBase64 && setPreviewImage(project.target.imageBase64)}
                                        >
                                            {project.target?.imageBase64 ? (
                                                <img 
                                                    src={project.target.imageBase64} 
                                                    alt={project.target?.name} 
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Target className="h-5 w-5 text-indigo-600" />
                                            )}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base truncate max-w-[140px]">
                                                {project.target?.name || "Sin Objetivo"}
                                            </CardTitle>
                                            <CardDescription className="text-xs flex items-center gap-1">
                                                {formatDate(project.createdAt)}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Badge 
                                        variant="outline" 
                                        className={`text-[9px] uppercase tracking-tighter px-1.5 py-0 h-4 border-none ${
                                            project.stance === "AGAINST" 
                                                ? "bg-red-500 text-white" 
                                                : "bg-emerald-500 text-white"
                                        }`}
                                    >
                                        {project.stance === "AGAINST" ? "CONTRA" : "FAVOR"}
                                    </Badge>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-30 group-hover:opacity-100">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44">
                                            <DropdownMenuItem onClick={() => setViewingProject(project)} className="cursor-pointer">
                                                <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
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
                                                <Pencil className="mr-2 h-4 w-4" /> Editar Ajutes
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 cursor-pointer"
                                                onClick={() => setDeletingProject(project)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Borrar Proyecto
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4 pt-4 flex-1 flex flex-col">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-muted-foreground uppercase font-black opacity-30 tracking-widest">Estrategia</Label>
                                <p className="text-xs font-medium text-muted-foreground leading-relaxed italic border-l-2 pl-3 py-1">
                                    &ldquo;{project.name}&rdquo;
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                <div className="bg-muted/30 p-2.5 rounded-xl border border-border/40 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Hash className="h-3 w-3 text-muted-foreground opacity-50" />
                                        <span className="text-[10px] uppercase font-black text-muted-foreground/30">Órdenes</span>
                                    </div>
                                    <span className="text-lg font-bold">{project._count.botOrders}</span>
                                </div>
                                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <MessageSquare className="h-3 w-3 text-indigo-500 opacity-50" />
                                        <span className="text-[10px] uppercase font-black text-indigo-600/30">Comments</span>
                                    </div>
                                    <span className="text-lg font-bold text-indigo-600">{project._count.genComments}</span>
                                </div>
                            </div>
                        </CardContent>

                        <div className="px-4 py-3 border-t bg-muted/10 mt-auto flex items-center justify-between">
                            <div className="flex -space-x-1.5 opacity-60">
                                {project.urlFacebook && <Facebook className="h-4 w-4 text-blue-600" />}
                                {project.urlInstagram && <Instagram className="h-4 w-4 text-pink-600" />}
                                {project.urlTiktok && <TikTokIcon className="h-4 w-4" />}
                            </div>

                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 bg-background border-border shadow-xs hover:bg-indigo-600 hover:text-white transition-all px-4"
                                onClick={() => {
                                    try {
                                        localStorage.setItem("active_project", JSON.stringify({
                                            id: project.id,
                                            name: project.name
                                        }))
                                        window.dispatchEvent(new Event("project-changed"))
                                    } catch { }
                                }}
                            >
                                <Link href={`/dashboard/projects/${project.id}`}>
                                    Entrar <ExternalLink className="h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="sm:max-w-md flex flex-col items-center gap-4 p-8">
                     <DialogHeader className="text-center w-full">
                        <DialogTitle className="text-xl font-bold">Previsualización de Foto</DialogTitle>
                    </DialogHeader>
                    {previewImage && (
                        <div className="w-80 h-80 rounded-2xl overflow-hidden border-2 border-border shadow-lg">
                            <img 
                                src={previewImage} 
                                alt="Preview" 
                                className="h-full w-full object-cover" 
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Standard Edit Dialog */}
            <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold uppercase tracking-tight">Ajustes de Proyecto</DialogTitle>
                        <DialogDescription>Modifica la configuración de {editingProject?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {error && <div className="bg-red-500/10 p-3 rounded-lg text-red-600 text-xs">{error}</div>}
                        <div className="space-y-2">
                             <Label>Nombre de la Estrategia</Label>
                             <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                             <Label>Objetivo Vinculado</Label>
                             <Select value={editTargetId} onValueChange={setEditTargetId}>
                                <SelectTrigger disabled={targetsLoading}>
                                    <SelectValue placeholder={targetsLoading ? "Cargando..." : "Selecciona un objetivo..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none">Ninguno</SelectItem>
                                    {userTargets.map(t => (
                                        <SelectItem key={t.id} value={t.id} disabled={blockedTargetIds.includes(t.id) && t.id !== editingProject?.targetId}>
                                            {t.name} {blockedTargetIds.includes(t.id) && t.id !== editingProject?.targetId ? "(En uso)" : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>
                        </div>
                        <div className="flex items-center justify-between border-t pt-4">
                            <div className="space-y-0.5">
                                <Label>Postura de la IA</Label>
                                <p className="text-xs text-muted-foreground">{editStance === "FAVOR" ? "A Favor" : "En Contra"}</p>
                            </div>
                            <Switch 
                                checked={editStance === "AGAINST"} 
                                onCheckedChange={(checked) => setEditStance(checked ? "AGAINST" : "FAVOR")} 
                                className="data-[state=unchecked]:bg-emerald-500 data-[state=checked]:bg-red-500"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Monitoreo Automático</Label>
                            <Switch checked={editAutoOrdersEnabled} onCheckedChange={setEditAutoOrdersEnabled} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingProject(null)}>Cancelar</Button>
                        <Button onClick={handleEdit} disabled={loading}>{loading ? "Guardando..." : "Confirmar"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deletingProject} onOpenChange={() => setDeletingProject(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción es permanente y detendrá cualquier monitoreo activo.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
