"use client"

import { useState, useEffect } from "react"
import { Plus, Target, Check, ChevronsUpDown, AlertCircle, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createProject, getBlockedTargetIds, getTargetUsage, updateProject } from "@/lib/actions/projects"
import { getUserTargets } from "@/lib/actions/targets"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type TargetType = {
    id: string
    name: string
    content: any
}

export function CreateProjectButton() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [targetId, setTargetId] = useState<string>("")
    const [stance, setStance] = useState<"FAVOR" | "AGAINST">("FAVOR")
    const [autoOrdersEnabled, setAutoOrdersEnabled] = useState(false)
    const [urlFacebook, setUrlFacebook] = useState("")
    const [urlInstagram, setUrlInstagram] = useState("")
    const [urlTiktok, setUrlTiktok] = useState("")

    const [loading, setLoading] = useState(false)
    const [targets, setTargets] = useState<TargetType[]>([])
    const [targetsLoading, setTargetsLoading] = useState(false)
    const [blockedTargetIds, setBlockedTargetIds] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [stanceWarning, setStanceWarning] = useState<string | null>(null)

    // Load targets when dialog opens
    useEffect(() => {
        if (open) {
            setTargetsLoading(true)
            setTargets([])
            Promise.all([getUserTargets(), getBlockedTargetIds()])
                .then(([res, blocked]) => {
                    setTargets(res as any[])
                    setBlockedTargetIds((blocked as any) ?? [])
                })
                .finally(() => {
                    setTargetsLoading(false)
                })
        }
    }, [open])

    // Check target usage and auto-set opposite stance
    useEffect(() => {
        if (!targetId || targetId === '_none') {
            setStanceWarning(null)
            return
        }

        getTargetUsage(targetId).then(result => {
            if (result.error || !result.projects) {
                setStanceWarning(null)
                return
            }

            if (result.projects.length > 0) {
                const existingProject = result.projects[0]
                const oppositeStance = existingProject.stance === 'FAVOR' ? 'AGAINST' : 'FAVOR'
                setStance(oppositeStance)

                const currentStanceText = existingProject.stance === 'FAVOR' ? 'A Favor' : 'En Contra'
                const newStanceText = oppositeStance === 'FAVOR' ? 'A Favor' : 'En Contra'
                setStanceWarning(`Este objetivo ya se usa en "${existingProject.name}" con postura "${currentStanceText}". Se configuró automáticamente como "${newStanceText}".`)
            } else {
                setStanceWarning(null)
            }
        })
    }, [targetId])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!targetId || targetId === '_none') {
            setError("Debes seleccionar un objetivo para el proyecto.")
            setLoading(false)
            return
        }

        const result = await createProject(name, targetId, stance, {
            autoOrdersEnabled,
            urlFacebook: urlFacebook || null,
            urlInstagram: urlInstagram || null,
            urlTiktok: urlTiktok || null
        })

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setOpen(false)
            setName("")
            setTargetId("")
            setStance("FAVOR")
            setAutoOrdersEnabled(false)
            setUrlFacebook("")
            setUrlInstagram("")
            setUrlTiktok("")
            setLoading(false)
        }
    }

    const hasTargets = targets.length > 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Proyecto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Proyecto</DialogTitle>
                        <DialogDescription>
                            Define el proyecto y su estrategia.
                        </DialogDescription>
                    </DialogHeader>

                    {targetsLoading ? (
                        <div className="py-6 flex flex-col items-center text-center space-y-4">
                            <div className="p-3 bg-muted/50 rounded-full border">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-semibold">Cargando objetivos...</h4>
                                <p className="text-sm text-muted-foreground">Un momento por favor.</p>
                            </div>
                        </div>
                    ) : !hasTargets && !loading ? (
                        <div className="py-6 flex flex-col items-center text-center space-y-4">
                             <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 rounded-full border border-amber-200/50 dark:border-amber-900/50">
                                 <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                             </div>
                             <div className="space-y-1">
                                 <h4 className="font-semibold text-amber-950 dark:text-amber-100">Primero necesitas un Objetivo</h4>
                                 <p className="text-sm text-amber-800 dark:text-amber-300/80">Para crear un proyecto, primero debes configurar un objetivo en tu biblioteca.</p>
                             </div>
                            <Button asChild variant="default" className="w-full">
                                <Link href="/dashboard/targets" onClick={() => setOpen(false)}>
                                    Ir a crear Objetivo <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-5 py-4">
                            {error && (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                </div>
                            )}

                            {stanceWarning && (
                                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300">
                                    {stanceWarning}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label>1. Selecciona el Objetivo</Label>
                                <Select value={targetId} onValueChange={setTargetId} required>
                                    <SelectTrigger className={!targetId ? "border-amber-300 ring-2 ring-amber-100" : ""}>
                                        <SelectValue placeholder="Selecciona..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {targets.map(t => {
                                            const isBlocked = blockedTargetIds.includes(t.id)
                                            return (
                                                <SelectItem key={t.id} value={t.id} disabled={isBlocked}>
                                                    {t.name}{isBlocked ? " (No disponible)" : ""}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground flex justify-between">
                                    <span>¿El objetivo no está en la lista?</span>
                                    <Link href="/dashboard/targets" className="text-primary hover:underline" onClick={() => setOpen(false)}>
                                        Crear nuevo en biblioteca
                                    </Link>
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">2. Nombre del Proyecto</Label>
                                <Input
                                    id="name"
                                    placeholder="Ej: Campaña Verano 2026"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    minLength={2}
                                    required
                                    disabled={!targetId}
                                />
                            </div>

                            {targetId && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-muted/40 p-3 rounded-md border animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm">3. Postura Estratégica</Label>
                                            <p className="text-[10px] text-muted-foreground max-w-[200px]">IA a favor o en contra del objetivo.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-medium transition-colors ${stance === 'AGAINST' ? 'text-muted-foreground' : 'text-primary'}`}>A Favor</span>
                                            <Switch
                                                checked={stance === 'AGAINST'}
                                                onCheckedChange={(checked) => setStance(checked ? 'AGAINST' : 'FAVOR')}
                                                type="button"
                                            />
                                            <span className={`text-[10px] font-medium transition-colors ${stance === 'AGAINST' ? 'text-destructive' : 'text-muted-foreground'}`}>En Contra</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-2">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold">Órdenes Automáticas</Label>
                                            <p className="text-[10px] text-muted-foreground">Activa el monitoreo automático.</p>
                                        </div>
                                        <Switch
                                            checked={autoOrdersEnabled}
                                            onCheckedChange={setAutoOrdersEnabled}
                                        />
                                    </div>

                                    {autoOrdersEnabled && (
                                        <div className="grid gap-3 animate-in fade-in slide-in-from-top-2 duration-300 bg-muted/30 p-3 rounded-md border">
                                            <div className="grid gap-1">
                                                <Label htmlFor="fb" className="text-[10px] uppercase font-bold text-muted-foreground">Facebook URL</Label>
                                                <Input
                                                    id="fb"
                                                    placeholder="https://facebook.com/..."
                                                    value={urlFacebook}
                                                    onChange={(e) => setUrlFacebook(e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div className="grid gap-1">
                                                <Label htmlFor="ig" className="text-[10px] uppercase font-bold text-muted-foreground">Instagram URL</Label>
                                                <Input
                                                    id="ig"
                                                    placeholder="https://instagram.com/..."
                                                    value={urlInstagram}
                                                    onChange={(e) => setUrlInstagram(e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div className="grid gap-1">
                                                <Label htmlFor="tk" className="text-[10px] uppercase font-bold text-muted-foreground">TikTok URL</Label>
                                                <Input
                                                    id="tk"
                                                    placeholder="https://tiktok.com/@..."
                                                    value={urlTiktok}
                                                    onChange={(e) => setUrlTiktok(e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || !targetId}>
                            {loading ? "Creando..." : "Crear Proyecto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
