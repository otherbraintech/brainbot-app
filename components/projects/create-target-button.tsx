"use client"

import { useState, useEffect } from "react"
import { Target, RefreshCw, Check, AlertCircle, Link as LinkIcon, Edit, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { assignTargetToProject, getBlockedTargetIds } from "@/lib/actions/projects"
import { getUserTargets } from "@/lib/actions/targets"
import { toast } from "sonner"
import { TargetFormDialog } from "@/components/targets/target-form-dialog" // Import reusable for EDIT only

type Project = {
    id: string
    name: string
    targetId?: string | null
    target?: {
        id: string
        name: string
        content: any
    } | null
    stance?: "FAVOR" | "AGAINST"
}

type TargetType = {
    id: string
    name: string
    content: any
}

export function CreateTargetButton({
    project,
    fullWidth = true,
}: {
    project: Project
    fullWidth?: boolean
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<"view" | "select">("view")

    // Data State
    const [userTargets, setUserTargets] = useState<TargetType[]>([])
    const [selectedTargetId, setSelectedTargetId] = useState<string>(project.targetId || "")
    const [stance, setStance] = useState<"FAVOR" | "AGAINST">(project.stance || "FAVOR")
    const [blockedTargetIds, setBlockedTargetIds] = useState<string[]>([])

    // Init
    useEffect(() => {
        if (open) {
            Promise.all([getUserTargets(), getBlockedTargetIds()]).then(([targets, blocked]) => {
                setUserTargets(targets as any)
                setBlockedTargetIds((blocked as any) ?? [])
            })

            if (!project.targetId) {
                setMode("select")
            } else {
                setMode("view")
                setSelectedTargetId(project.targetId)
                setStance(project.stance || "FAVOR")
            }
        }
    }, [open, project.targetId, project.stance])

    const handleAssign = async () => {
        if (!selectedTargetId) {
            toast.error("Selecciona un objetivo")
            return
        }
        setLoading(true)
        const result = await assignTargetToProject(project.id, selectedTargetId, stance)
        setLoading(false)
        if (result.success) {
            toast.success("Proyecto actualizado")
            setOpen(false)
            router.refresh()
        } else {
            toast.error(result.error)
        }
    }

    // Helper to see if any targets exist
    const hasTargets = userTargets.length > 0

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={project.targetId ? "outline" : "secondary"}
                    className={fullWidth ? "w-full mt-2 border-slate-200 shadow-sm justify-between group" : "h-10 border-slate-200 shadow-sm"}
                >
                    <div className="flex items-center">
                        <Target className={`h-4 w-4 mr-2 ${project.targetId ? 'text-primary' : 'text-muted-foreground'}`} />
                        {project.targetId
                            ? "Ver Objetivo"
                            : "Definir Objetivo"
                        }
                    </div>
                    {project.targetId && (
                        <Badge variant={project.stance === 'AGAINST' ? "destructive" : "default"} className="ml-2 text-[10px] h-5 px-1.5">
                            {project.stance === 'AGAINST' ? 'En Contra' : 'A Favor'}
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'view' ? "Objetivo del Proyecto" : "Configurar Objetivo"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'view'
                            ? "Gestiona el objetivo asignado y la postura estratégica."
                            : "Selecciona un objetivo de tu biblioteca para este proyecto."}
                    </DialogDescription>
                </DialogHeader>

                {/* VIEW MODE */}
                {mode === 'view' && project.target && (() => {
                    const data = project.target.content.target?.[0] || project.target.content
                    return (
                        <div className="py-4 space-y-6">
                            <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-lg">{project.target.name}</h4>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                            {data.target_type === 'COMPANY' ? 'Empresa' : (data.target_type === 'PERSON' ? 'Persona' : 'Genérico')}
                                        </p>
                                    </div>
                                    <Badge variant={project.stance === 'AGAINST' ? "destructive" : "default"}>
                                        {project.stance === 'AGAINST' ? 'EN CONTRA' : 'A FAVOR'}
                                    </Badge>
                                </div>

                                <div className="pt-2 border-t mt-2 flex gap-2">
                                    {/* Only allow editing CONTENT via the dedicated dialog, reusing it here just for 'Edit' button access if needed, or redirect to targets page? 
                                    User wanted strict flow. Let's redirect to targets page for deep editing to avoid clutter. 
                                */}
                                    <Button variant="outline" size="sm" asChild className="text-xs h-7">
                                        <Link href="/dashboard/targets">
                                            <Edit className="mr-2 h-3 w-3" /> Editar en Biblioteca
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Acciones del Proyecto</h4>
                                <div className="grid gap-3">
                                    <Button variant="outline" onClick={() => setMode('select')} className="justify-start">
                                        <RefreshCw className="mr-2 h-4 w-4" /> Cambiar Objetivo Asignado
                                    </Button>
                                    {/* We could allow just changing stance here without full switch */}
                                    <div className="flex items-center justify-between p-3 border rounded-md">
                                        <Label className="text-sm cursor-pointer">Invertir Postura (Favor/Contra)</Label>
                                        <Switch
                                            checked={project.stance === 'AGAINST'}
                                            onCheckedChange={async (v) => {
                                                // Quick toggle stance
                                                const newStance = v ? 'AGAINST' : 'FAVOR'
                                                const res = await assignTargetToProject(project.id, project.targetId!, newStance)
                                                if (res.success) {
                                                    toast.success(`Postura cambiada a ${newStance === 'AGAINST' ? 'En Contra' : 'A Favor'}`)
                                                    router.refresh()
                                                    setOpen(false)
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })()}

                {/* SELECT MODE */}
                {mode === 'select' && (
                    <div className="py-4 space-y-6">
                        {!hasTargets ? (
                            <div className="flex flex-col items-center text-center space-y-4 py-4">
                                <div className="p-3 bg-amber-50 rounded-full">
                                    <AlertCircle className="h-6 w-6 text-amber-600" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-amber-900">No tienes objetivos</h4>
                                    <p className="text-sm text-amber-700">Debes crear objetivos en tu biblioteca antes de asignarlos.</p>
                                </div>
                                <Button asChild variant="default" className="w-full">
                                    <Link href="/dashboard/targets" onClick={() => setOpen(false)}>
                                        Ir a Biblioteca <LinkIcon className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    <Label>Objetivo a Asignar</Label>
                                    <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {userTargets.map(t => {
                                                const isBlocked = blockedTargetIds.includes(t.id)
                                                const isCurrent = t.id === (project.targetId || "")
                                                const disabled = isBlocked && !isCurrent
                                                return (
                                                    <SelectItem key={t.id} value={t.id} disabled={disabled}>
                                                        {t.name}{disabled ? " (No disponible)" : ""}
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm">Postura Estratégica</Label>
                                        <p className="text-xs text-muted-foreground">Comportamiento de los bots.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-medium ${stance === 'AGAINST' ? 'text-muted-foreground' : 'text-primary'}`}>A Favor</span>
                                        <Switch
                                            checked={stance === 'AGAINST'}
                                            onCheckedChange={(checked) => setStance(checked ? 'AGAINST' : 'FAVOR')}
                                        />
                                        <span className={`text-xs font-medium ${stance === 'AGAINST' ? 'text-destructive' : 'text-muted-foreground'}`}>En Contra</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {mode === 'view' ? (
                        <Button variant="ghost" onClick={() => setOpen(false)}>Cerrar</Button>
                    ) : (
                        <div className="flex w-full justify-between">
                            <Button variant="ghost" onClick={() => project.targetId ? setMode('view') : setOpen(false)}>Cancelar</Button>
                            {hasTargets && (
                                <Button onClick={handleAssign} disabled={!selectedTargetId || loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Asignar Proyecto
                                </Button>
                            )}
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
