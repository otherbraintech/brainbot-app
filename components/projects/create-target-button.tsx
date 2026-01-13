"use client"

import { useState, useEffect } from "react"
import { Target, Plus, Upload, X, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createTargetAction, updateTargetAction } from "@/lib/actions/projects"
import { toast } from "sonner"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type Project = {
    id: string
    name: string
    target?: any
}

export function CreateTargetButton({
    project,
    fullWidth = true,
}: {
    project: Project
    fullWidth?: boolean
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [targetType, setTargetType] = useState<"PERSON" | "COMPANY">("PERSON")

    // Manual Edit State
    const [isEditing, setIsEditing] = useState(false)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [editedTarget, setEditedTarget] = useState<any>(null)

    // Form State
    const [basicIdentity, setBasicIdentity] = useState({
        name: "",
        known_as: [] as string[],
        role: "",
        public_domain: "",
        location: { city: "", region: "", country: "" }
    })
    const [contextualIdentity, setContextualIdentity] = useState({
        current_phase: "",
        main_axis: "",
        opposition_frame: "",
        affiliation: "",
        target_audience: [] as string[]
    })
    const [discourseHints, setDiscourseHints] = useState({
        tone: [] as string[],
        language_style: [] as string[],
        key_topics: [] as string[],
        taboo_topics: [] as string[]
    })
    const [behavioralSignals, setBehavioralSignals] = useState({
        public_style: [] as string[],
        emotional_projection: [] as string[]
    })
    const [visualHints, setVisualHints] = useState({
        gender: "",
        age_range: "",
        build: "",
        style: [] as string[]
    })
    const [referenceImages, setReferenceImages] = useState<{ type: "base64", value: string }[]>([])
    const [constraints, setConstraints] = useState({
        must_not_be_confused_with: [] as string[],
        narrative_priority: [] as string[]
    })
    const [userNotes, setUserNotes] = useState("")

    // Helpers for tags
    const [tempTags, setTempTags] = useState<Record<string, string>>({})

    // Persistencia
    const persistenceKey = `target_form_${project.id}`

    useEffect(() => {
        const createTarget = searchParams.get("createTarget")
        if (createTarget === "1") {
            setOpen(true)
            router.replace(`/dashboard/projects/${project.id}`)
        }
    }, [project.id, router, searchParams])

    // Cargar datos al montar
    useEffect(() => {
        const savedData = localStorage.getItem(persistenceKey)
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData)
                if (parsed.step) setStep(parsed.step)
                if (parsed.targetType) setTargetType(parsed.targetType)
                if (parsed.basicIdentity) setBasicIdentity(parsed.basicIdentity)
                if (parsed.contextualIdentity) setContextualIdentity(parsed.contextualIdentity)
                if (parsed.discourseHints) setDiscourseHints(parsed.discourseHints)
                if (parsed.behavioralSignals) setBehavioralSignals(parsed.behavioralSignals)
                if (parsed.visualHints) setVisualHints(parsed.visualHints)
                if (parsed.referenceImages) setReferenceImages(parsed.referenceImages)
                if (parsed.constraints) setConstraints(parsed.constraints)
                if (parsed.userNotes) setUserNotes(parsed.userNotes)
            } catch (e) {
                console.error("Error al cargar datos guardados:", e)
            }
        }
    }, [project.id, persistenceKey])

    // Guardar datos al cambiar
    useEffect(() => {
        const dataToSave = {
            step,
            targetType,
            basicIdentity,
            contextualIdentity,
            discourseHints,
            behavioralSignals,
            visualHints,
            referenceImages,
            constraints,
            userNotes
        }
        localStorage.setItem(persistenceKey, JSON.stringify(dataToSave))
    }, [step, targetType, basicIdentity, contextualIdentity, discourseHints, behavioralSignals, visualHints, referenceImages, constraints, userNotes, persistenceKey])

    // Types for form state fields
    type FormField = 'basicIdentity' | 'contextualIdentity' | 'discourseHints' | 'behavioralSignals' | 'visualHints' | 'constraints'

    const addTag = (field: FormField, subField: string, value: string) => {
        if (!value.trim()) return
        const setterMap: Record<FormField, React.Dispatch<React.SetStateAction<any>>> = {
            basicIdentity: setBasicIdentity,
            contextualIdentity: setContextualIdentity,
            discourseHints: setDiscourseHints,
            behavioralSignals: setBehavioralSignals,
            visualHints: setVisualHints,
            constraints: setConstraints
        }

        const setter = setterMap[field]
        if (!setter) return

        // Dividir por comas, limpiar espacios y filtrar vacíos
        const newTags = value.split(',').map(t => t.trim()).filter(t => t !== "")
        if (newTags.length === 0) return

        setter((prev: any) => ({
            ...prev,
            [subField]: [...prev[subField], ...newTags]
        }))
        setTempTags(prev => ({ ...prev, [`${field}_${subField}`]: "" }))
    }

    const removeTag = (field: FormField, subField: string, index: number) => {
        const setterMap: Record<FormField, React.Dispatch<React.SetStateAction<any>>> = {
            basicIdentity: setBasicIdentity,
            contextualIdentity: setContextualIdentity,
            discourseHints: setDiscourseHints,
            behavioralSignals: setBehavioralSignals,
            visualHints: setVisualHints,
            constraints: setConstraints
        }

        const setter = setterMap[field]
        if (!setter) return

        setter((prev: any) => ({
            ...prev,
            [subField]: prev[subField].filter((_: any, i: number) => i !== index)
        }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast.error("Por favor selecciona un archivo de imagen válido")
            return
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("La imagen es demasiado grande (máximo 5MB)")
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            // readAsDataURL guaranteed to include "data:image/[mime];base64," prefix
            setReferenceImages(prev => [...prev, { type: "base64", value: base64String }])
        }
        reader.onerror = () => {
            toast.error("Error al leer el archivo de imagen")
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async () => {
        setLoading(true)
        const payload = {
            project_id: project.id,
            target_input: {
                target_type: targetType,
                basic_identity: basicIdentity,
                contextual_identity: contextualIdentity,
                discourse_hints: discourseHints,
                behavioral_signals: behavioralSignals,
                visual_hints: visualHints,
                reference_images: referenceImages,
                constraints: constraints,
                user_notes: userNotes
            }
        }

        try {
            const result = await createTargetAction(payload)
            if (result.success) {
                toast.success("Objetivo creado y enviado correctamente")
                setOpen(false)
                resetForm()
            } else {
                toast.error(result.error || "Error al enviar el objetivo")
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setStep(1)
        setTargetType("PERSON")
        setBasicIdentity({ name: "", known_as: [], role: "", public_domain: "", location: { city: "", region: "", country: "" } })
        setContextualIdentity({ current_phase: "", main_axis: "", opposition_frame: "", affiliation: "", target_audience: [] })
        setDiscourseHints({ tone: [], language_style: [], key_topics: [], taboo_topics: [] })
        setBehavioralSignals({ public_style: [], emotional_projection: [] })
        setVisualHints({ gender: "", age_range: "", build: "", style: [] })
        setReferenceImages([])
        setConstraints({ must_not_be_confused_with: [], narrative_priority: [] })
        setUserNotes("")
        localStorage.removeItem(persistenceKey)
    }

    const handleManualSave = async () => {
        try {
            setLoading(true)
            const result = await updateTargetAction(project.id, editedTarget)
            setLoading(false)
            if (result.success) {
                toast.success("Objetivo actualizado manualmente")
                setIsEditing(false)
                setOpen(false)
            } else {
                toast.error(result.error)
            }
        } catch (e) {
            toast.error("Error al guardar el objetivo.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={project.target ? "secondary" : "secondary"}
                    className={fullWidth ? "w-full mt-2 border-slate-200 shadow-sm" : "h-10 border-slate-200 shadow-sm"}
                >
                    <Target className="h-4 w-4 mr-2" />
                    {loading ? "Creando target..." : (project.target ? "Ver Objetivo" : "Crear Objetivo")}
                </Button>
                {/* Note: changed outline to secondary to avoid flat look */}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-fit max-h-[95vh] md:h-[90vh] md:max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle>
                        <div className="flex items-center gap-2">
                            {project.target && !isRegenerating ? (
                                <Target className="w-5 h-5 text-primary" />
                            ) : (
                                <Plus className="w-5 h-5 text-primary" />
                            )}
                            <span>{(project.target ? (isEditing ? 'Editar Objetivo Manualmente' : (isRegenerating ? 'Regenerar Objetivo' : 'Objetivo Definido')) : 'Definir Objetivo') + " - " + project.name}</span>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        {project.target
                            ? (isEditing ? 'Modifica el JSON del objetivo con cuidado. Debe ser un JSON válido.' : (isRegenerating ? `Configura el nuevo perfil psicológico y social. Paso ${step} de 5.` : 'Este es el perfil psicológico y social generado para este proyecto.'))
                            : `Configura el perfil psicológico y social del objetivo. Paso ${step} de 5.`
                        }
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 min-h-0">
                    {(project.target && !isRegenerating) ? (
                        isEditing ? (
                            <div className="py-4">
                                <TargetFormEditor
                                    data={editedTarget}
                                    onChange={setEditedTarget}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-end pt-4 gap-2">
                                    <Button variant="secondary" size="sm" className="border-slate-200 shadow-sm" onClick={() => {
                                        setIsRegenerating(true)
                                        setStep(1)
                                    }}>
                                        Regenerar Objetivo
                                    </Button>
                                    <Button variant="secondary" size="sm" className="border-slate-200 shadow-sm" onClick={() => {
                                        setEditedTarget(project.target)
                                        setIsEditing(true)
                                    }}>
                                        Editar Manualmente
                                    </Button>
                                </div>
                                <TargetViewer data={project.target} />
                            </div>
                        )
                    ) : (
                        <div className="space-y-6 py-4">
                            {step === 1 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Identidad Básica</h3>
                                    <div className="space-y-2">
                                        <Label>Tipo de Objetivo</Label>
                                        <Select value={targetType} onValueChange={(v: "PERSON" | "COMPANY") => setTargetType(v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona el tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PERSON">Marca Personal / Persona</SelectItem>
                                                <SelectItem value="COMPANY">Marca Empresarial / Empresa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nombre / Razón Social</Label>
                                            <Input value={basicIdentity.name} onChange={e => setBasicIdentity({ ...basicIdentity, name: e.target.value })} placeholder="Ej: Mario Cronenbold o Empresa X" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Rol / Rubro</Label>
                                            <Input value={basicIdentity.role} onChange={e => setBasicIdentity({ ...basicIdentity, role: e.target.value })} placeholder="Ej: Candidato política o Sector Minero" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Conocido como (Apodos)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={tempTags.basicIdentity_known_as || ""}
                                                onChange={e => setTempTags({ ...tempTags, basicIdentity_known_as: e.target.value })}
                                                onKeyPress={e => e.key === 'Enter' && addTag('basicIdentity', 'known_as', tempTags.basicIdentity_known_as)}
                                                placeholder="Presiona Enter para agregar"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => addTag('basicIdentity', 'known_as', tempTags.basicIdentity_known_as)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {basicIdentity.known_as.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="gap-1 px-2 py-1 group transition-colors">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag('basicIdentity', 'known_as', i)}
                                                        className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors cursor-pointer"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Ciudad</Label>
                                            <Input size={1} value={basicIdentity.location.city} onChange={e => setBasicIdentity({ ...basicIdentity, location: { ...basicIdentity.location, city: e.target.value } })} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Región</Label>
                                            <Input size={1} value={basicIdentity.location.region} onChange={e => setBasicIdentity({ ...basicIdentity, location: { ...basicIdentity.location, region: e.target.value } })} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">País</Label>
                                            <Input size={1} value={basicIdentity.location.country} onChange={e => setBasicIdentity({ ...basicIdentity, location: { ...basicIdentity.location, country: e.target.value } })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Dominio Público (Ej: Político, Social, Comercial)</Label>
                                        <Input value={basicIdentity.public_domain} onChange={e => setBasicIdentity({ ...basicIdentity, public_domain: e.target.value })} placeholder="Ej: political, commercial" />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Contexto y Audiencia</h3>
                                    <div className="space-y-2 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Fase / Etapa</Label>
                                                <Input value={contextualIdentity.current_phase} onChange={e => setContextualIdentity({ ...contextualIdentity, current_phase: e.target.value })} placeholder="Ej: Campaña o Lanzamiento" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Eje Principal / Enfoque</Label>
                                                <Input value={contextualIdentity.main_axis} onChange={e => setContextualIdentity({ ...contextualIdentity, main_axis: e.target.value })} placeholder="Ej: Gestión popular o Innovación" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Marco de Oposición / Competencia</Label>
                                                <Input value={contextualIdentity.opposition_frame} onChange={e => setContextualIdentity({ ...contextualIdentity, opposition_frame: e.target.value })} placeholder="Ej: Vieja política o Low-cost" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Afiliación / Alianzas</Label>
                                                <Input value={contextualIdentity.affiliation} onChange={e => setContextualIdentity({ ...contextualIdentity, affiliation: e.target.value })} placeholder="Ej: Independiente o Holding Z" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 mt-2">
                                            <Label className="text-xs">Audiencia Objetivo</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={tempTags.contextualIdentity_target_audience || ""}
                                                    onChange={e => setTempTags({ ...tempTags, contextualIdentity_target_audience: e.target.value })}
                                                    onKeyPress={e => e.key === 'Enter' && addTag('contextualIdentity', 'target_audience', tempTags.contextualIdentity_target_audience)}
                                                    placeholder="Enter para sumar"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => addTag('contextualIdentity', 'target_audience', tempTags.contextualIdentity_target_audience)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {contextualIdentity.target_audience.map((tag, i) => (
                                                    <Badge key={i} variant="secondary" className="gap-1 px-2 py-1 group transition-colors">
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag('contextualIdentity', 'target_audience', i)}
                                                            className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors cursor-pointer"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Discurso y Estilo</h3>
                                    <div className="space-y-2">
                                        <Label>Tonos (Ej: Carismático, Directo)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={tempTags.discourseHints_tone || ""}
                                                onChange={e => setTempTags({ ...tempTags, discourseHints_tone: e.target.value })}
                                                onKeyPress={e => e.key === 'Enter' && addTag('discourseHints', 'tone', tempTags.discourseHints_tone)}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => addTag('discourseHints', 'tone', tempTags.discourseHints_tone)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {discourseHints.tone.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="gap-1 px-2 py-1 group transition-colors">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag('discourseHints', 'tone', i)}
                                                        className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors cursor-pointer"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Temas Clave</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={tempTags.discourseHints_key_topics || ""}
                                                onChange={e => setTempTags({ ...tempTags, discourseHints_key_topics: e.target.value })}
                                                onKeyPress={e => e.key === 'Enter' && addTag('discourseHints', 'key_topics', tempTags.discourseHints_key_topics)}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => addTag('discourseHints', 'key_topics', tempTags.discourseHints_key_topics)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {discourseHints.key_topics.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="gap-1 px-2 py-1 group transition-colors">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag('discourseHints', 'key_topics', i)}
                                                        className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors cursor-pointer"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Temas Tabú / A Evitar</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={tempTags.discourseHints_taboo_topics || ""}
                                                onChange={e => setTempTags({ ...tempTags, discourseHints_taboo_topics: e.target.value })}
                                                onKeyPress={e => e.key === 'Enter' && addTag('discourseHints', 'taboo_topics', tempTags.discourseHints_taboo_topics)}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => addTag('discourseHints', 'taboo_topics', tempTags.discourseHints_taboo_topics)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {discourseHints.taboo_topics.map((tag, i) => (
                                                <Badge key={i} variant="destructive" className="gap-1 px-2 py-1 group transition-colors">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag('discourseHints', 'taboo_topics', i)}
                                                        className="hover:bg-white/40 rounded-full p-0.5 transition-colors text-white cursor-pointer"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Estilo de Lenguaje (Ej: Coloquiral, Regional)</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={tempTags.discourseHints_language_style || ""}
                                                    onChange={e => setTempTags({ ...tempTags, discourseHints_language_style: e.target.value })}
                                                    onKeyPress={e => e.key === 'Enter' && addTag('discourseHints', 'language_style', tempTags.discourseHints_language_style)}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => addTag('discourseHints', 'language_style', tempTags.discourseHints_language_style)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {discourseHints.language_style.map((tag, i) => (
                                                    <Badge key={i} variant="secondary" className="gap-1 px-2 py-1 group transition-colors">
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag('discourseHints', 'language_style', i)}
                                                            className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors cursor-pointer"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Comportamiento y Visual</h3>
                                    <div className="space-y-2">
                                        <Label>Estilo Público (Señales)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={tempTags.behavioralSignals_public_style || ""}
                                                onChange={e => setTempTags({ ...tempTags, behavioralSignals_public_style: e.target.value })}
                                                onKeyPress={e => e.key === 'Enter' && addTag('behavioralSignals', 'public_style', tempTags.behavioralSignals_public_style)}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => addTag('behavioralSignals', 'public_style', tempTags.behavioralSignals_public_style)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {behavioralSignals.public_style.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="gap-1 px-2 py-1 group transition-colors">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag('behavioralSignals', 'public_style', i)}
                                                        className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors cursor-pointer"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Proyección Emocional (Ej: Confianza, Cercanía)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={tempTags.behavioralSignals_emotional_projection || ""}
                                                onChange={e => setTempTags({ ...tempTags, behavioralSignals_emotional_projection: e.target.value })}
                                                onKeyPress={e => e.key === 'Enter' && addTag('behavioralSignals', 'emotional_projection', tempTags.behavioralSignals_emotional_projection)}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => addTag('behavioralSignals', 'emotional_projection', tempTags.behavioralSignals_emotional_projection)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {behavioralSignals.emotional_projection.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="gap-1 px-2 py-1 group transition-colors">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag('behavioralSignals', 'emotional_projection', i)}
                                                        className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors cursor-pointer"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Identidad</Label>
                                            <Select value={visualHints.gender} onValueChange={(v) => setVisualHints({ ...visualHints, gender: v })}>
                                                <SelectTrigger className="h-9 cursor-pointer">
                                                    <SelectValue placeholder="Selecciona" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Opción A</SelectItem>
                                                    <SelectItem value="female">Opción B</SelectItem>
                                                    <SelectItem value="non-binary">Opción C</SelectItem>
                                                    <SelectItem value="neutral">Genérico</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Madurez</Label>
                                            <Input value={visualHints.age_range} onChange={e => setVisualHints({ ...visualHints, age_range: e.target.value })} placeholder="Ej: Consolidada, Emergente..." />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Presencia</Label>
                                            <Input value={visualHints.build} onChange={e => setVisualHints({ ...visualHints, build: e.target.value })} placeholder="Ej: Sólida, Discreta..." />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Estilo Visual (Ej: Business casual)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={tempTags.visualHints_style || ""}
                                                onChange={e => setTempTags({ ...tempTags, visualHints_style: e.target.value })}
                                                onKeyPress={e => e.key === 'Enter' && addTag('visualHints', 'style', tempTags.visualHints_style)}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => addTag('visualHints', 'style', tempTags.visualHints_style)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {visualHints.style.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="gap-1 px-2 py-1 group transition-colors">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag('visualHints', 'style', i)}
                                                        className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors cursor-pointer"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Imágenes de Referencia (Upload)</Label>
                                        <div className="flex items-center gap-4 border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors relative cursor-pointer">
                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                            <div className="text-sm text-muted-foreground">
                                                Haz clic o arrastra una imagen para convertirla a Base64
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 mt-4">
                                            {referenceImages.map((img, i) => (
                                                <div key={i} className="relative aspect-square border rounded-md overflow-hidden bg-muted">
                                                    <img src={img.value} alt="Preview" className="object-cover w-full h-full" />
                                                    <Button size="icon" variant="destructive" className="h-5 w-5 absolute top-1 right-1 cursor-pointer" onClick={() => setReferenceImages(prev => prev.filter((_, idx) => idx !== i))}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Finalización</h3>
                                    <div className="space-y-2">
                                        <Label>No ser confundido con</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={tempTags.constraints_must_not_be_confused_with || ""}
                                                onChange={e => setTempTags({ ...tempTags, constraints_must_not_be_confused_with: e.target.value })}
                                                onKeyPress={e => e.key === 'Enter' && addTag('constraints', 'must_not_be_confused_with', tempTags.constraints_must_not_be_confused_with)}
                                                placeholder="Enter para sumar"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => addTag('constraints', 'must_not_be_confused_with', tempTags.constraints_must_not_be_confused_with)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {constraints.must_not_be_confused_with.map((tag, i) => (
                                                <Badge key={i} variant="destructive" className="gap-1 px-2 py-1 group transition-colors">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag('constraints', 'must_not_be_confused_with', i)}
                                                        className="hover:bg-white/40 rounded-full p-0.5 transition-colors cursor-pointer"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Prioridades Narrativas</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={tempTags.constraints_narrative_priority || ""}
                                                onChange={e => setTempTags({ ...tempTags, constraints_narrative_priority: e.target.value })}
                                                onKeyPress={e => e.key === 'Enter' && addTag('constraints', 'narrative_priority', tempTags.constraints_narrative_priority)}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => addTag('constraints', 'narrative_priority', tempTags.constraints_narrative_priority)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {constraints.narrative_priority.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="gap-1 px-2 py-1 group transition-colors">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag('constraints', 'narrative_priority', i)}
                                                        className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors cursor-pointer"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Notas adicionales del usuario</Label>
                                        <Textarea
                                            value={userNotes}
                                            onChange={e => setUserNotes(e.target.value)}
                                            placeholder="Cualquier detalle extra que sea relevante..."
                                            rows={4}
                                        />
                                    </div>
                                    <div className="rounded-md bg-muted p-4 text-xs font-mono overflow-auto max-h-[150px]">
                                        Resumen: {referenceImages.length} imágenes, {contextualIdentity.target_audience.length} públicos, {discourseHints.key_topics.length} temas.
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="p-6 pt-2 border-t shrink-0 flex items-center justify-between">
                    <div className="flex gap-2">
                        {isEditing ? (
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>
                                Cancelar
                            </Button>
                        ) : (
                            !project.target && step > 1 && (
                                <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={loading} className="cursor-pointer hover:bg-muted">
                                    Anterior
                                </Button>
                            )
                        )}
                    </div>
                    {isEditing ? (
                        <Button onClick={handleManualSave} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    ) : (
                        !project.target ? (
                            <div className="flex gap-2">
                                {step < 5 ? (
                                    <Button onClick={() => setStep(s => s + 1)} className="cursor-pointer shadow-md transition-all hover:scale-105">Siguiente</Button>
                                ) : (
                                    <Button onClick={handleSubmit} disabled={loading || !basicIdentity.name} className="cursor-pointer shadow-md transition-all hover:scale-105 bg-primary text-primary-foreground">
                                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {loading ? "Creando target..." : "Enviar Objetivo"}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Button onClick={() => setOpen(false)}>Cerrar</Button>
                        )
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function TargetFormEditor({ data, onChange }: { data: any, onChange: (val: any) => void }) {
    if (!data) return null;

    const target = data.target?.[0] || data;
    const isNested = !!data.target?.[0];

    const updateNested = (path: string, value: any) => {
        const newData = { ...data };
        const parts = path.split('.');
        let current = newData;

        // Si es la estructura nested {"target": [...]}, empezamos desde target[0]
        if (isNested) {
            newData.target = [...newData.target];
            newData.target[0] = { ...newData.target[0] };
            current = newData.target[0];
        }

        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current[parts[i]] = { ...current[parts[i]] };
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        onChange(newData);
    };

    const ti = target.target_identity || {};
    const pi = ti.political_identity || ti.brand_identity || {};
    const vr = ti.visual_reference || {};
    const dp = ti.discourse_profile || ti.brand_communication_profile || {};
    const cw = target.comparison_weights || { visual: 0.5, discourse: 0.3, behavior: 0.2 };

    return (
        <Tabs defaultValue="identity" className="w-full">
            <div className="overflow-x-auto pb-2">
                <TabsList className="w-full h-auto flex-wrap justify-start bg-muted p-1">
                    <TabsTrigger value="identity" className="flex-1 min-w-[100px]">Identidad</TabsTrigger>
                    <TabsTrigger value="brand" className="flex-1 min-w-[100px]">Marca</TabsTrigger>
                    <TabsTrigger value="visual" className="flex-1 min-w-[100px]">Visual</TabsTrigger>
                    <TabsTrigger value="comm" className="flex-1 min-w-[110px]">Comunicación</TabsTrigger>
                    <TabsTrigger value="exclusion" className="flex-1 min-w-[100px]">Exclusión</TabsTrigger>
                    <TabsTrigger value="weights" className="flex-1 min-w-[100px]">Pesos</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="identity" className="space-y-4 pt-4">
                <>
                    <div className="grid gap-2">
                        <Label>Nombre</Label>
                        <Input value={ti.name || ""} onChange={e => updateNested("target_identity.name", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Rol / Categoría</Label>
                        <Input value={ti.role || ti.category || ""} onChange={e => updateNested(ti.role ? "target_identity.role" : "target_identity.category", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Ciudad</Label>
                        <Input value={ti.city || ""} onChange={e => updateNested("target_identity.city", e.target.value)} />
                    </div>
                    {(ti.location_source_note !== undefined || !isNested) && (
                        <div className="grid gap-2">
                            <Label>Nota de origen de ubicación</Label>
                            <Textarea value={ti.location_source_note || ""} onChange={e => updateNested("target_identity.location_source_note", e.target.value)} />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label>Identidad</Label>
                        <Select value={ti.gender || ""} onValueChange={v => updateNested("target_identity.gender", v)}>
                            <SelectTrigger className="h-9 cursor-pointer">
                                <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Opción A</SelectItem>
                                <SelectItem value="female">Opción B</SelectItem>
                                <SelectItem value="non-binary">Opción C</SelectItem>
                                <SelectItem value="neutral">Genérico</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </>
            </TabsContent>

            <TabsContent value="brand" className="space-y-4 pt-4">
                <div className="grid gap-2">
                    <Label>Eje Central</Label>
                    <Input value={pi.core_axis || ""} onChange={e => updateNested(ti.political_identity ? "target_identity.political_identity.core_axis" : "target_identity.brand_identity.core_axis", e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label>Marco Narrativo</Label>
                    <Textarea value={pi.narrative_frame || ""} onChange={e => updateNested(ti.political_identity ? "target_identity.political_identity.narrative_frame" : "target_identity.brand_identity.narrative_frame", e.target.value)} />
                </div>
            </TabsContent>

            <TabsContent value="visual" className="space-y-4 pt-4">
                {vr.color_palette !== undefined ? (
                    <div className="grid gap-2">
                        <Label>Paleta de Colores</Label>
                        <Input value={vr.color_palette || ""} onChange={e => updateNested("target_identity.visual_reference.color_palette", e.target.value)} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Atributos Primarios</Label>
                            <Input value={vr.hair || ""} onChange={e => updateNested("target_identity.visual_reference.hair", e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Identidad Distintiva</Label>
                            <Input value={vr.face || ""} onChange={e => updateNested("target_identity.visual_reference.face", e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Atmósfera Visual</Label>
                            <Input value={vr.expression || ""} onChange={e => updateNested("target_identity.visual_reference.expression", e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Acentos y Detalles</Label>
                            <Input value={vr.eyebrows || ""} onChange={e => updateNested("target_identity.visual_reference.eyebrows", e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Estructura y Porte</Label>
                            <Input value={vr.build || ""} onChange={e => updateNested("target_identity.visual_reference.build", e.target.value)} />
                        </div>
                        <div className="grid gap-2 col-span-2">
                            <Label>Estética Dominante</Label>
                            <Textarea value={vr.clothing || ""} onChange={e => updateNested("target_identity.visual_reference.clothing", e.target.value)} />
                        </div>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="comm" className="space-y-4 pt-4">
                <>
                    <div className="grid gap-2">
                        <Label>Tonos</Label>
                        <BadgeInput
                            values={dp.tone || []}
                            onChange={v => updateNested(ti.discourse_profile ? "target_identity.discourse_profile.tone" : "target_identity.brand_communication_profile.tone", v)}
                            placeholder="Ej: Carismático, Directo"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Lenguaje</Label>
                        <BadgeInput
                            values={dp.language || []}
                            onChange={v => updateNested(ti.discourse_profile ? "target_identity.discourse_profile.language" : "target_identity.brand_communication_profile.language", v)}
                            placeholder="Ej: Coloquial, Regional"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Comportamiento</Label>
                        <BadgeInput
                            values={dp.behavior || []}
                            onChange={v => updateNested(ti.discourse_profile ? "target_identity.discourse_profile.behavior" : "target_identity.brand_communication_profile.behavior", v)}
                            placeholder="Ej: Empático, Proactivo"
                        />
                    </div>
                </>
            </TabsContent>

            <TabsContent value="exclusion" className="space-y-4 pt-4">
                <div className="grid gap-2">
                    <Label>Reglas de Exclusión</Label>
                    <BadgeInput
                        values={target.exclusion_rules || []}
                        onChange={v => updateNested("exclusion_rules", v)}
                        placeholder="Ej: No mencionar política, No usar emojis"
                        variant="destructive"
                    />
                </div>
            </TabsContent>

            <TabsContent value="weights" className="space-y-6 pt-4">
                {/* Nuevos Pesos */}
                {Object.keys(cw).includes('visual') ? (
                    <>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Visual ({Math.round((cw.visual || 0) * 100)}%)</Label>
                                <span className="text-xs font-mono">{(cw.visual || 0).toFixed(2)}</span>
                            </div>
                            <Slider
                                value={[cw.visual || 0]}
                                step={0.01}
                                min={0}
                                max={1}
                                onValueChange={([v]) => updateNested("comparison_weights.visual", v)}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Discurso ({Math.round((cw.discourse || 0) * 100)}%)</Label>
                                <span className="text-xs font-mono">{(cw.discourse || 0).toFixed(2)}</span>
                            </div>
                            <Slider
                                value={[cw.discourse || 0]}
                                step={0.01}
                                min={0}
                                max={1}
                                onValueChange={([v]) => updateNested("comparison_weights.discourse", v)}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Comportamiento ({Math.round((cw.behavior || 0) * 100)}%)</Label>
                                <span className="text-xs font-mono">{(cw.behavior || 0).toFixed(2)}</span>
                            </div>
                            <Slider
                                value={[cw.behavior || 0]}
                                step={0.01}
                                min={0}
                                max={1}
                                onValueChange={([v]) => updateNested("comparison_weights.behavior", v)}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Contexto ({Math.round((cw.context || 0) * 100)}%)</Label>
                                <span className="text-xs font-mono">{(cw.context || 0).toFixed(2)}</span>
                            </div>
                            <Slider
                                value={[cw.context || 0]}
                                step={0.01}
                                min={0}
                                max={1}
                                onValueChange={([v]) => updateNested("comparison_weights.context", v)}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Branding Visual ({Math.round((cw.visual_branding || 0) * 100)}%)</Label>
                                <span className="text-xs font-mono">{(cw.visual_branding || 0).toFixed(2)}</span>
                            </div>
                            <Slider
                                value={[cw.visual_branding || 0]}
                                step={0.01}
                                min={0}
                                max={1}
                                onValueChange={([v]) => updateNested("comparison_weights.visual_branding", v)}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Concepto de Negocio ({Math.round((cw.business_concept || 0) * 100)}%)</Label>
                                <span className="text-xs font-mono">{(cw.business_concept || 0).toFixed(2)}</span>
                            </div>
                            <Slider
                                value={[cw.business_concept || 0]}
                                step={0.01}
                                min={0}
                                max={1}
                                onValueChange={([v]) => updateNested("comparison_weights.business_concept", v)}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Enfoque de Servicio ({Math.round((cw.implied_service_focus || 0) * 100)}%)</Label>
                                <span className="text-xs font-mono">{(cw.implied_service_focus || 0).toFixed(2)}</span>
                            </div>
                            <Slider
                                value={[cw.implied_service_focus || 0]}
                                step={0.01}
                                min={0}
                                max={1}
                                onValueChange={([v]) => updateNested("comparison_weights.implied_service_focus", v)}
                            />
                        </div>
                    </>
                )}
            </TabsContent>
        </Tabs>
    );
}

function TargetViewer({ data }: { data: any }) {
    if (!data) return null;

    // Normalización: si viene el array "target", usamos el primer elemento
    const target = data.target?.[0] || data;

    const ti = target.target_identity || {}
    const pi = ti.political_identity || ti.brand_identity || {}
    const vr = ti.visual_reference || {}
    const dp = ti.discourse_profile || ti.brand_communication_profile || {}
    const cw = target.comparison_weights || {}

    return (
        <div className="space-y-8 py-6">
            <section className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-xl font-bold text-primary">{ti.name || 'Sin nombre'}</h3>
                    <Badge variant="outline">{ti.role || ti.type || 'N/D'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{ti.role || ti.category}</p>
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                    <div>
                        <span className="font-semibold block">Ubicación</span>
                        <span className="text-muted-foreground">{ti.city}</span>
                    </div>
                    {ti.location_source_note && (
                        <div className="col-span-2 text-xs italic text-muted-foreground">
                            * {ti.location_source_note}
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                    <div className="h-1 w-4 bg-primary rounded-full" />
                    Identidad
                </h4>
                <div className="space-y-3 pl-6 border-l-2 border-muted">
                    <div>
                        <span className="text-xs font-bold uppercase text-muted-foreground">Eje Central</span>
                        <p className="text-sm mt-1">{pi.core_axis}</p>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase text-muted-foreground">Marco Narrativo</span>
                        <p className="text-sm mt-1 italic">"{pi.narrative_frame}"</p>
                    </div>
                    {ti.gender && (
                        <div>
                            <span className="text-xs font-bold uppercase text-muted-foreground">Identidad</span>
                            <p className="text-sm mt-1">{
                                ti.gender === 'male' ? 'Opción A' :
                                    ti.gender === 'female' ? 'Opción B' :
                                        ti.gender === 'non-binary' ? 'Opción C' :
                                            ti.gender === 'neutral' ? 'Genérico' : ti.gender
                            }</p>
                        </div>
                    )}
                    {pi.values && (
                        <div>
                            <span className="text-xs font-bold uppercase text-muted-foreground">Valores</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {pi.values?.map((v: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="font-normal">{v}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                    <div className="h-1 w-4 bg-primary rounded-full" />
                    Referencia Visual
                </h4>
                <div className="grid gap-4 pl-6 border-l-2 border-muted">
                    {vr.color_palette ? (
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <span className="text-xs font-bold uppercase text-muted-foreground">Paleta de Colores</span>
                            <p className="text-sm mt-1">{vr.color_palette}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs font-bold uppercase text-muted-foreground">Atributos Primarios</span>
                                <p className="text-sm mt-1">{vr.hair}</p>
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase text-muted-foreground">Identidad Distintiva</span>
                                <p className="text-sm mt-1">{vr.face}</p>
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase text-muted-foreground">Atmósfera Visual</span>
                                <p className="text-sm mt-1">{vr.expression}</p>
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase text-muted-foreground">Acentos y Detalles</span>
                                <p className="text-sm mt-1">{vr.eyebrows}</p>
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase text-muted-foreground">Estructura y Porte</span>
                                <p className="text-sm mt-1">{vr.build}</p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-xs font-bold uppercase text-muted-foreground">Estética Dominante</span>
                                <p className="text-sm mt-1">{vr.clothing}</p>
                            </div>
                        </div>
                    )}

                    {vr.overall_aesthetic_impression && (
                        <p className="text-sm italic text-muted-foreground border-t pt-3 mt-1">
                            {vr.overall_aesthetic_impression}
                        </p>
                    )}
                </div>
            </section>

            <section className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                    <div className="h-1 w-4 bg-primary rounded-full" />
                    Comunicación y Perfil
                </h4>
                <div className="grid gap-6 pl-6 border-l-2 border-muted">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-xs font-bold uppercase text-muted-foreground">Tonos</span>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {dp.tone?.map((t: string, i: number) => <li key={i}>{t}</li>)}
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs font-bold uppercase text-muted-foreground">Lenguaje</span>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {dp.language?.map((l: string, i: number) => <li key={i}>{l}</li>)}
                            </ul>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Comportamiento</span>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            {dp.behavior?.map((b: string, i: number) => <li key={i}>{b}</li>)}
                        </ul>
                    </div>
                </div>
            </section>

            {cw && (
                <section className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                        <div className="h-1 w-4 bg-primary rounded-full" />
                        Pesos de Comparación
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-6 border-l-2 border-muted">
                        {Object.entries(cw).map(([key, value]: [string, any]) => {
                            const translatedKey = {
                                'visual': 'Visual',
                                'discourse': 'Discurso',
                                'behavior': 'Comportamiento',
                                'context': 'Contexto',
                                'visual_branding': 'Branding Visual',
                                'business_concept': 'Concepto de Negocio',
                                'implied_service_focus': 'Enfoque de Servicio'
                            }[key] || key;

                            return (
                                <div key={key} className="bg-muted/50 p-2 rounded text-center">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">{translatedKey}</span>
                                    <span className="text-lg font-mono">{Math.round(value * 100)}%</span>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {(target.exclusion_rules || data.exclusion_rules) && (
                <section className="space-y-3 bg-destructive/5 p-4 rounded-lg border border-destructive/20">
                    <h4 className="font-bold text-destructive text-sm uppercase">Reglas de Exclusión</h4>
                    <ul className="list-disc list-inside text-sm space-y-2 text-destructive/80">
                        {(target.exclusion_rules || data.exclusion_rules).map((rule: string, i: number) => <li key={i}>{rule}</li>)}
                    </ul>
                </section>
            )}
        </div>
    )
}
function BadgeInput({
    values,
    onChange,
    placeholder,
    variant = "secondary"
}: {
    values: string[],
    onChange: (val: string[]) => void,
    placeholder?: string,
    variant?: "secondary" | "destructive"
}) {
    const [inputValue, setInputValue] = useState("");

    const handleAdd = () => {
        if (!inputValue.trim()) return;
        const newTags = inputValue.split(',').map(t => t.trim()).filter(t => t !== "");
        if (newTags.length > 0) {
            onChange([...values, ...newTags]);
            setInputValue("");
        }
    };

    const handleRemove = (index: number) => {
        onChange(values.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                    placeholder={placeholder || "Presiona Enter para agregar"}
                />
                <Button type="button" size="sm" onClick={handleAdd} variant="secondary">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex flex-wrap gap-1">
                {values.map((tag, i) => (
                    <Badge key={i} variant={variant} className="gap-1 px-2 py-1 group transition-colors">
                        {tag}
                        <button
                            type="button"
                            onClick={() => handleRemove(i)}
                            className={variant === "destructive"
                                ? "hover:bg-white/40 rounded-full p-0.5 transition-colors text-white cursor-pointer"
                                : "hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors cursor-pointer"
                            }
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
}
