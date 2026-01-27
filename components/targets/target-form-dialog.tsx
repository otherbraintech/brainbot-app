"use client"
// Target Form Dialog Component


import { useState, useEffect, useRef } from "react"
import { Target, Plus, Upload, X, Loader2, Info, ArrowRightLeft, ArrowRight, ArrowLeft, MapPin } from "lucide-react"
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { createTargetWithWebhook, updateTarget } from "@/lib/actions/targets"
import { toast } from "sonner"

// Type Definitions
export type TargetData = {
    id?: string
    name?: string
    imageBase64?: string | null
    content: {
        target: {
            target_id?: string
            target_type: "PERSON" | "COMPANY" | "GENERIC"
            identity_nature: string
            basic_identity: {
                name: string
                role: string
                public_domain: string
                location: { city: string, country: string }
            }
            contextual_identity: {
                self_description: string
                main_axis: string
                target_audience: string[]
                opposition_frame: string
            }
            comparison_weights: {
                visual: number
                discourse: number
                behavior: number
                context: number
            }
            exclusion_rules: string[]
            visual_reference: {
                scene: string
                focus: string
                quality: string
                appearance: string
                notable_elements: string[]
                colors: string[]
                logo_or_name_visible: boolean
                readable_text: string[]
                reference_images?: {
                    asset_id: string
                    type: "base64"
                    mime: string
                    label: string
                    value: string
                }[]
            }
            recognition_hints: {
                visual_markers: string[]
                primary_presence: string
                contextual_markers: string[]
            }
            extended_notes: string
            user_notes: string
        }[]
    }
}

interface TargetFormDialogProps {
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    initialData?: TargetData | null
    mode?: "create" | "edit" | "view"
    onSuccess?: (target: any) => void
}

export function TargetFormDialog({
    trigger,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    initialData,
    mode = "create",
    onSuccess
}: TargetFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isOpen = controlledOpen ?? internalOpen
    const setOpen = setControlledOpen ?? setInternalOpen
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)

    // Form Data State
    const [targetType, setTargetType] = useState<"PERSON" | "COMPANY">("COMPANY")
    const [basicIdentity, setBasicIdentity] = useState({
        name: "",
        role: "",
        public_domain: "",
        location: { city: "", country: "" }
    })
    const [contextualIdentity, setContextualIdentity] = useState({
        self_description: "",
        main_axis: "",
        target_audience: [] as string[],
        opposition_frame: ""
    })
    const [constraints, setConstraints] = useState({
        must_not_be_confused_with: [] as string[]
    })
    const [visualAssets, setVisualAssets] = useState<{
        reference_images: {
            asset_id: string,
            type: "base64",
            mime: string,
            label: string,
            value: string
        }[]
    }>({ reference_images: [] })
    const [extendedNotes, setExtendedNotes] = useState("")
    const [userNotes, setUserNotes] = useState("")
    const [imageBase64, setImageBase64] = useState<string | null>(null)

    // Advanced / Processed State
    const [comparisonWeights, setComparisonWeights] = useState({
        visual: 0.4,
        discourse: 0.35,
        behavior: 0.15,
        context: 0.1
    })
    const [visualReference, setVisualReference] = useState({
        scene: "no_claro",
        focus: "mixto",
        quality: "media",
        appearance: "n/a",
        notable_elements: [] as string[],
        colors: [] as string[],
        logo_or_name_visible: false,
        readable_text: [] as string[]
    })

    const [recognitionHints, setRecognitionHints] = useState({
        visual_markers: [] as string[],
        primary_presence: "",
        contextual_markers: [] as string[]
    })

    const [identityNature, setIdentityNature] = useState("comercial")


    // Helper State
    const [tempTags, setTempTags] = useState<Record<string, string>>({})

    // Persistence Key
    const STORAGE_KEY = "target_form_draft"

    // Load draft on mount (only for creation)
    useEffect(() => {
        if (typeof window !== "undefined" && mode === 'create') {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                try {
                    const draft = JSON.parse(saved)
                    if (draft.targetType) setTargetType(draft.targetType)
                    if (draft.identityNature) setIdentityNature(draft.identityNature)
                    if (draft.basicIdentity) setBasicIdentity(draft.basicIdentity)
                    if (draft.contextualIdentity) setContextualIdentity(draft.contextualIdentity)
                    if (draft.recognitionHints) setRecognitionHints(draft.recognitionHints)
                    if (draft.constraints) setConstraints(draft.constraints)
                    if (draft.visualAssets) setVisualAssets(draft.visualAssets)
                    if (draft.extendedNotes) setExtendedNotes(draft.extendedNotes)
                    if (draft.userNotes) setUserNotes(draft.userNotes)
                } catch (e) {
                    console.error("Error loading draft", e)
                }
            }
        }
    }, [mode])

    // Save draft on change (only for creation)
    useEffect(() => {
        if (typeof window !== "undefined" && mode === 'create') {
            const draft = {
                targetType,
                identityNature,
                basicIdentity,
                contextualIdentity,
                recognitionHints,
                constraints,
                visualAssets,
                extendedNotes,
                userNotes
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
        }
    }, [targetType, basicIdentity, contextualIdentity, constraints, visualAssets, extendedNotes, userNotes, mode])

    // Init data on open/change
    useEffect(() => {
        if (isOpen && initialData?.content) {
            // New structure has .target array, old structure has fields directly in .content
            const data = (initialData.content as any).target?.[0] || initialData.content

            if (initialData.imageBase64) {
                setImageBase64(initialData.imageBase64)
            }

            try {
                if (data.target_type) setTargetType(data.target_type === 'GENERIC' ? 'COMPANY' : data.target_type)
                if (data.identity_nature) setIdentityNature(data.identity_nature)

                if (data.basic_identity) {
                    setBasicIdentity({
                        name: data.basic_identity.name || "",
                        role: data.basic_identity.role || "",
                        public_domain: data.basic_identity.public_domain || "",
                        location: {
                            city: data.basic_identity.location?.city || "",
                            country: data.basic_identity.location?.country || ""
                        }
                    })
                }

                if (data.contextual_identity) {
                    setContextualIdentity({
                        self_description: data.contextual_identity.self_description || "",
                        main_axis: data.contextual_identity.main_axis || "",
                        target_audience: data.contextual_identity.target_audience || [],
                        opposition_frame: data.contextual_identity.opposition_frame || ""
                    })
                }

                if (data.recognition_hints) {
                    setRecognitionHints({
                        visual_markers: data.recognition_hints.visual_markers || [],
                        primary_presence: data.recognition_hints.primary_presence || "",
                        contextual_markers: data.recognition_hints.contextual_markers || []
                    })
                }

                // Map exclusion_rules (new) or constraints (old)
                if (data.exclusion_rules) setConstraints({ must_not_be_confused_with: data.exclusion_rules })
                else if (data.constraints) setConstraints(data.constraints || { must_not_be_confused_with: [] })

                // Map visual_reference.reference_images (new) or visual_assets (old)
                if (data.visual_reference?.reference_images) setVisualAssets({ reference_images: data.visual_reference.reference_images })
                else if (data.visual_assets) setVisualAssets(data.visual_assets || { reference_images: [] })

                // Map Advanced data
                if (data.comparison_weights) setComparisonWeights(data.comparison_weights)
                if (data.visual_reference) {
                    const { reference_images, ...vRef } = data.visual_reference
                    setVisualReference(prev => ({ ...prev, ...vRef }))
                }
                setExtendedNotes(data.extended_notes || "")
                setUserNotes(data.user_notes || "")
            } catch (e) {
                console.error("Error loading target data", e)
            }
        } else if (isOpen && mode === 'create') {
            // Reset form
            setStep(1)
            setBasicIdentity({ name: "", role: "", public_domain: "", location: { city: "", country: "" } })
            setContextualIdentity({ self_description: "", main_axis: "", target_audience: [], opposition_frame: "" })
            setRecognitionHints({ visual_markers: [], primary_presence: "", contextual_markers: [] })
            setIdentityNature("comercial")
            setConstraints({ must_not_be_confused_with: [] })
            setVisualAssets({ reference_images: [] })
            setExtendedNotes("")
            setUserNotes("")
            setImageBase64(null)
        }
    }, [isOpen, initialData, mode])

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImageBase64(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async () => {
        setLoading(true)

        // Construct Payload according to new schema
        const generateId = () => `target_${typeof crypto !== 'undefined' ? crypto.randomUUID() : Date.now()}`

        // Get existing target for merging (to avoid losing metadata not in the form)
        const existingTarget = (initialData?.content as any)?.target?.[0] || {}

        const targetObject = {
            ...existingTarget, // Preserve existing fields (comparison_weights, visual traits, etc)
            target_id: mode === 'edit' ? (existingTarget.target_id || generateId()) : generateId(),
            target_type: targetType === 'COMPANY' ? 'GENERIC' : 'PERSON',
            identity_nature: identityNature,
            basic_identity: {
                ...basicIdentity,
                location: {
                    ...basicIdentity.location,
                }
            },
            contextual_identity: contextualIdentity,
            comparison_weights: comparisonWeights,
            exclusion_rules: constraints.must_not_be_confused_with || [],
            visual_reference: {
                ...visualReference,
                reference_images: visualAssets.reference_images // Overwrite/add our images
            },
            recognition_hints: recognitionHints,
            extended_notes: extendedNotes,
            user_notes: userNotes
        }

        const finalPayload = {
            target: [targetObject]
        }

        const payloadWithImage = {
            ...finalPayload,
            imageBase64: imageBase64
        }

        try {
            let result;
            if (mode === 'create') {
                // Wrapper expected by action
                const createPayload = {
                    target_input: finalPayload,
                    imageBase64: imageBase64 // Pass image separately
                }
                result = await createTargetWithWebhook(createPayload)
            } else {
                if (!initialData?.id) throw new Error("No ID for update")
                result = await updateTarget(initialData?.id!, {
                    ...finalPayload,
                    imageBase64: imageBase64 // Pass image separately
                })
            }

            if (result.success) {
                if (mode === 'create') localStorage.removeItem(STORAGE_KEY)
                toast.success(mode === 'create' ? "Objetivo creado" : "Objetivo actualizado")
                setOpen(false)
                if (onSuccess) onSuccess((result as any).target || result)
            } else {
                toast.error(result.error || "Error al procesar")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error inesperado")
        } finally {
            setLoading(false)
        }
    }

    // --- Helpers (Tags, Images) ---
    const addTag = (field: string, subField: string, value: string, tempKey: string) => {
        if (!value || !value.trim()) return
        if (field === 'contextualIdentity' && subField === 'target_audience') {
            setContextualIdentity(prev => ({ ...prev, target_audience: [...prev.target_audience, value.trim()] }))
        } else if (field === 'constraints' && subField === 'must_not_be_confused_with') {
            setConstraints(prev => ({ ...prev, must_not_be_confused_with: [...prev.must_not_be_confused_with, value.trim()] }))
        } else if (field === 'recognitionHints' && subField === 'visual_markers') {
            setRecognitionHints(prev => ({ ...prev, visual_markers: [...prev.visual_markers, value.trim()] }))
        } else if (field === 'recognitionHints' && subField === 'contextual_markers') {
            setRecognitionHints(prev => ({ ...prev, contextual_markers: [...prev.contextual_markers, value.trim()] }))
        } else if (field === 'visualReference' && subField === 'colors') {
            setVisualReference(prev => ({ ...prev, colors: [...prev.colors, value.trim()] }))
        } else if (field === 'visualReference' && subField === 'notable_elements') {
            setVisualReference(prev => ({ ...prev, notable_elements: [...prev.notable_elements, value.trim()] }))
        } else if (field === 'visualReference' && subField === 'readable_text') {
            setVisualReference(prev => ({ ...prev, readable_text: [...prev.readable_text, value.trim()] }))
        }
        setTempTags(prev => ({ ...prev, [tempKey]: "" }))
    }

    const removeTag = (field: string, subField: string, index: number) => {
        if (field === 'contextualIdentity' && subField === 'target_audience') {
            setContextualIdentity(prev => ({ ...prev, target_audience: prev.target_audience.filter((_, i) => i !== index) }))
        } else if (field === 'constraints' && subField === 'must_not_be_confused_with') {
            setConstraints(prev => ({ ...prev, must_not_be_confused_with: prev.must_not_be_confused_with.filter((_, i) => i !== index) }))
        } else if (field === 'recognitionHints' && subField === 'visual_markers') {
            setRecognitionHints(prev => ({ ...prev, visual_markers: prev.visual_markers.filter((_, i) => i !== index) }))
        } else if (field === 'recognitionHints' && subField === 'contextual_markers') {
            setRecognitionHints(prev => ({ ...prev, contextual_markers: prev.contextual_markers.filter((_, i) => i !== index) }))
        } else if (field === 'visualReference' && subField === 'colors') {
            setVisualReference(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }))
        } else if (field === 'visualReference' && subField === 'notable_elements') {
            setVisualReference(prev => ({ ...prev, notable_elements: prev.notable_elements.filter((_, i) => i !== index) }))
        } else if (field === 'visualReference' && subField === 'readable_text') {
            setVisualReference(prev => ({ ...prev, readable_text: prev.readable_text.filter((_, i) => i !== index) }))
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) return toast.error("Solo imágenes")
        if (file.size > 5 * 1024 * 1024) return toast.error("Máximo 5MB")

        const reader = new FileReader()
        reader.onloadend = () => {
            setVisualAssets(prev => ({
                ...prev,
                reference_images: [...prev.reference_images, {
                    asset_id: `img_${Date.now()}`,
                    type: "base64",
                    mime: file.type,
                    label: "Referencia",
                    value: reader.result as string
                }]
            }))
        }
        reader.readAsDataURL(file)
    }

    const updateImageLabel = (index: number, newLabel: string) => {
        setVisualAssets(prev => {
            const newImages = [...prev.reference_images]
            newImages[index].label = newLabel
            return { ...prev, reference_images: newImages }
        })
    }

    const InfoTooltip = ({ text }: { text: string }) => (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-zinc-400 cursor-help hover:text-primary transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px] p-3 text-xs bg-zinc-900 text-zinc-100 border-zinc-800"><p>{text}</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )

    const DataField = ({ label, value, icon: Icon }: { label: string, value: string | React.ReactNode, icon?: any }) => (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                {Icon && <Icon className="h-3 w-3" />}
                {label}
            </div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 min-h-[1.25rem]">
                {value || <span className="text-zinc-400 italic font-normal text-xs">No especificado</span>}
            </div>
        </div>
    )

    // --- HELPERS PARA RENDERIZADO (Reusables) ---
    const renderStep1 = (readOnly = false) => {
        if (readOnly) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {/* Identity Header in Body */}
                    <div className="md:col-span-2 space-y-2 mb-2">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                                {targetType === 'COMPANY' ? 'Empresa / Marca' : 'Persona / Marca Personal'}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {basicIdentity.role || 'Sin Rol'}
                            </Badge>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {basicIdentity.name || 'Sin Nombre'}
                        </h2>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary uppercase">
                                Naturaleza: {identityNature || 'comercial'}
                            </Badge>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <DataField label="Descripción Corta / Bio" value={contextualIdentity.self_description} />
                    </div>

                    <DataField label="Dominio Público" value={basicIdentity.public_domain} />
                    <DataField label="Ubicación" value={`${basicIdentity.location.city}${basicIdentity.location.country ? `, ${basicIdentity.location.country}` : ''}`} icon={MapPin} />
                </div>
            )
        }

        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label>Tipo de Objetivo</Label>
                        <InfoTooltip text="Define si el objetivo es una entidad corporativa/marca o una persona individual." />
                    </div>
                    <Select disabled={readOnly} value={targetType} onValueChange={(v: "PERSON" | "COMPANY") => setTargetType(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="COMPANY">Empresa / Marca</SelectItem>
                            <SelectItem value="PERSON">Persona / Marca Personal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Nombre / Razón Social</Label>
                            <InfoTooltip text="El nombre principal por el que se conoce a la marca o persona." />
                        </div>
                        <Input readOnly={readOnly} value={basicIdentity.name} onChange={e => setBasicIdentity({ ...basicIdentity, name: e.target.value })} placeholder="Ej: Mil Sabores" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Naturaleza de Identidad</Label>
                            <InfoTooltip text="Define si es comercial, personal, institucional, etc." />
                        </div>
                        <Input readOnly={readOnly} value={identityNature} onChange={e => setIdentityNature(e.target.value)} placeholder="Ej: comercial" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label>Rol / Rubro</Label>
                        <InfoTooltip text="La industria, categoría o profesión principal." />
                    </div>
                    <Input readOnly={readOnly} value={basicIdentity.role} onChange={e => setBasicIdentity({ ...basicIdentity, role: e.target.value })} placeholder="Ej: Gastronomía" />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label>Dominio Público</Label>
                        <InfoTooltip text="Áreas generales de interés o temas asociados (ej: tecnología, comida, deportes)." />
                    </div>
                    <Input readOnly={readOnly} value={basicIdentity.public_domain} onChange={e => setBasicIdentity({ ...basicIdentity, public_domain: e.target.value })} placeholder="Ej: food, tech" />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label>Ubicación</Label>
                        <InfoTooltip text="Lugar geográfico principal de operación o residencia." />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Input readOnly={readOnly} value={basicIdentity.location.city} onChange={e => setBasicIdentity({ ...basicIdentity, location: { ...basicIdentity.location, city: e.target.value } })} placeholder="Ciudad" />
                        <Input readOnly={readOnly} value={basicIdentity.location.country} onChange={e => setBasicIdentity({ ...basicIdentity, location: { ...basicIdentity.location, country: e.target.value } })} placeholder="País" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label>Descripción Corta / Bio</Label>
                        <InfoTooltip text="Una breve biografía o descripción de la misión y valores." />
                    </div>
                    <Textarea readOnly={readOnly} value={contextualIdentity.self_description} onChange={e => setContextualIdentity({ ...contextualIdentity, self_description: e.target.value })} placeholder="Breve descripción..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Eje Principal</Label>
                            <InfoTooltip text="El tema central sobre el que giran las comunicaciones." />
                        </div>
                        <Input readOnly={readOnly} value={contextualIdentity.main_axis} onChange={e => setContextualIdentity({ ...contextualIdentity, main_axis: e.target.value })} placeholder="Eje Principal" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Marco Oposición</Label>
                            <InfoTooltip text="Aquello a lo que la marca o persona se opone o busca cambiar." />
                        </div>
                        <Input readOnly={readOnly} value={contextualIdentity.opposition_frame} onChange={e => setContextualIdentity({ ...contextualIdentity, opposition_frame: e.target.value })} placeholder="Marco Oposición" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label>Audiencia</Label>
                        <InfoTooltip text="Etiquetas de los grupos de personas a los que se dirige." />
                    </div>
                    {!readOnly && (
                        <div className="flex gap-2">
                            <Input
                                value={tempTags.audience || ""}
                                onChange={e => setTempTags({ ...tempTags, audience: e.target.value })}
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag('contextualIdentity', 'target_audience', tempTags.audience, 'audience'))}
                                placeholder="Enter para sumar"
                            />
                            <Button type="button" size="sm" onClick={() => addTag('contextualIdentity', 'target_audience', tempTags.audience, 'audience')}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                        {contextualIdentity.target_audience.map((t, i) => (
                            <Badge key={i} variant="secondary" className="pr-1 py-0 h-7">
                                {t}
                                {!readOnly && (
                                    <button
                                        type="button"
                                        onClick={() => removeTag('contextualIdentity', 'target_audience', i)}
                                        className="ml-1 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-500 rounded-full p-0.5 transition-colors group"
                                    >
                                        <X className="h-3 w-3 group-hover:scale-110" />
                                    </button>
                                )}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderStep2 = (readOnly = false) => {
        if (readOnly) {
            return (
                <div className="space-y-8">
                    {visualAssets.reference_images.length > 0 && (
                        <div className="relative">
                            <ScrollArea className="w-full whitespace-nowrap pb-4">
                                <div className="flex gap-4">
                                    {visualAssets.reference_images.map((img, i) => (
                                        <div key={i} className="group relative w-32 md:w-40 aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm shrink-0 cursor-help">
                                            <img
                                                src={img.value}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                alt={img.label}
                                            />
                                            {/* Gradient Overlay for Label */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                                <span className="text-xs font-medium text-white line-clamp-2 leading-tight whitespace-normal">
                                                    {img.label}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </div>
                    )}



                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-4">
                            <DataField label="Presencia Principal" value={recognitionHints.primary_presence} />
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Marcadores Visuales</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {recognitionHints.visual_markers.map((m, i) => (
                                        <Badge key={i} variant="secondary" className="text-[10px]">{m}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Marcadores Contextuales</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {recognitionHints.contextual_markers.map((m, i) => (
                                        <Badge key={i} variant="secondary" className="text-[10px]">{m}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                        <DataField label="Contexto y Antecedentes" value={extendedNotes} />
                        <DataField label="Notas de Usuario" value={userNotes} />
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label>Imágenes Referenciales</Label>
                        <InfoTooltip text="Sube imágenes que representen visualmente al objetivo (logos, fotos de perfil)." />
                    </div>
                    {!readOnly && (
                        <div className="border-2 border-dashed p-4 rounded-lg text-center cursor-pointer hover:bg-muted/50 relative">
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                            <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Subir imagen</span>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {visualAssets.reference_images.map((img, i) => (
                            <div key={i} className="flex gap-2 border border-zinc-200 dark:border-zinc-800 p-2 rounded relative bg-zinc-50 dark:bg-zinc-900/40">
                                <img src={img.value} className="w-10 h-10 object-contain bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" alt="ref" />
                                <Input readOnly={readOnly} className="h-8 text-xs bg-white dark:bg-zinc-950" value={img.label} onChange={e => updateImageLabel(i, e.target.value)} placeholder="Etiqueta" />
                                {!readOnly && <X className="h-4 w-4 absolute top-1 right-1 cursor-pointer text-red-500" onClick={() => setVisualAssets(prev => ({ ...prev, reference_images: prev.reference_images.filter((_, idx) => idx !== i) }))} />}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                        <Label>Presencia Principal</Label>
                        <Input value={recognitionHints.primary_presence} onChange={e => setRecognitionHints({ ...recognitionHints, primary_presence: e.target.value })} placeholder="Ej: Logo con texto 3D..." />
                    </div>
                    <div className="space-y-2">
                        <Label>No confundir con</Label>
                        <div className="flex gap-2">
                            <Input
                                value={tempTags.constraints || ""}
                                onChange={e => setTempTags({ ...tempTags, constraints: e.target.value })}
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag('constraints', 'must_not_be_confused_with', tempTags.constraints, 'constraints'))}
                                placeholder="Enter para sumar"
                            />
                            <Button type="button" size="sm" onClick={() => addTag('constraints', 'must_not_be_confused_with', tempTags.constraints, 'constraints')}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {constraints.must_not_be_confused_with.map((t, i) => (
                                <Badge key={i} variant="destructive" className="pr-1 py-0 h-7">
                                    {t}
                                    <button
                                        type="button"
                                        onClick={() => removeTag('constraints', 'must_not_be_confused_with', i)}
                                        className="ml-1 hover:bg-red-800 dark:hover:bg-red-900 dark:hover:text-white hover:text-white rounded-full p-0.5 transition-colors group"
                                    >
                                        <X className="h-3 w-3 group-hover:scale-110" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Marcadores Visuales</Label>
                        <div className="flex gap-2">
                            <Input
                                value={tempTags.visual_markers || ""}
                                onChange={e => setTempTags({ ...tempTags, visual_markers: e.target.value })}
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag('recognitionHints', 'visual_markers', tempTags.visual_markers, 'visual_markers'))}
                                placeholder="Marcadores visuales..."
                            />
                            <Button type="button" size="sm" onClick={() => addTag('recognitionHints', 'visual_markers', tempTags.visual_markers, 'visual_markers')}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {recognitionHints.visual_markers.map((t, i) => (
                                <Badge key={i} variant="secondary" className="pr-1 py-0 h-7">
                                    {t}
                                    <button type="button" onClick={() => removeTag('recognitionHints', 'visual_markers', i)} className="ml-1 hover:text-red-500"><X className="h-3 w-3" /></button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Marcadores Contextuales</Label>
                        <div className="flex gap-2">
                            <Input
                                value={tempTags.contextual_markers || ""}
                                onChange={e => setTempTags({ ...tempTags, contextual_markers: e.target.value })}
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag('recognitionHints', 'contextual_markers', tempTags.contextual_markers, 'contextual_markers'))}
                                placeholder="Marcadores contextuales..."
                            />
                            <Button type="button" size="sm" onClick={() => addTag('recognitionHints', 'contextual_markers', tempTags.contextual_markers, 'contextual_markers')}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {recognitionHints.contextual_markers.map((t, i) => (
                                <Badge key={i} variant="secondary" className="pr-1 py-0 h-7">
                                    {t}
                                    <button type="button" onClick={() => removeTag('recognitionHints', 'contextual_markers', i)} className="ml-1 hover:text-red-500"><X className="h-3 w-3" /></button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label>Contexto y Antecedentes</Label>
                        <InfoTooltip text="Información histórica detallada, hitos importantes o contexto profundo." />
                    </div>
                    <Textarea readOnly={readOnly} value={extendedNotes} onChange={e => setExtendedNotes(e.target.value)} rows={4} placeholder="Historia, detalles..." />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label>Notas de Usuario</Label>
                        <InfoTooltip text="Tus notas personales o instrucciones específicas para el uso de este objetivo." />
                    </div>
                    <Textarea readOnly={readOnly} value={userNotes} onChange={e => setUserNotes(e.target.value)} rows={2} placeholder="Instrucciones específicas..." />
                </div>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Definir Objetivo</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[750px] w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl shadow-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
                <DialogHeader className={`p-6 pb-4 shrink-0 border-b bg-zinc-50/50 dark:bg-zinc-900/30`}>
                    <div className="flex items-center justify-between pr-12">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-lg relative group ${mode !== 'view' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                                onClick={() => mode !== 'view' && fileInputRef.current?.click()}
                            >
                                <div className={`absolute inset-0 rounded-lg overflow-hidden ${imageBase64 && mode !== 'view' ? 'border border-zinc-200 dark:border-zinc-800' : ''}`}>
                                    {imageBase64 && mode !== 'view' ? (
                                        <img src={imageBase64} alt="Target Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className={`h-full w-full flex items-center justify-center ${mode === 'view' ? 'bg-primary/10' : 'bg-primary/10'}`}>
                                            <Target className={`h-5 w-5 ${mode === 'view' ? 'text-primary' : 'text-primary'}`} />
                                        </div>
                                    )}
                                </div>
                                <div className="h-9 w-9 opacity-0"></div> {/* Spacer to maintain size if handled by absolute */}
                                {mode !== 'view' && (
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-800 rounded-full p-0.5 shadow-sm border border-zinc-200 dark:border-zinc-700">
                                        <Upload className="h-2.5 w-2.5 text-zinc-500" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                    accept="image/*"
                                />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight mb-1">
                                    {mode === 'create' ? 'Definir Nuevo Objetivo' : (mode === 'edit' ? 'Editar Objetivo' : 'Perfil de Objetivo')}
                                </DialogTitle>
                                <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                                    {mode === 'view' ? 'Detalle completo de identidad y estrategia.' : 'Completa los detalles para sincronizar con el motor de IA.'}
                                </DialogDescription>
                            </div>
                        </div>
                        {mode === 'view' && (
                            <div className="flex items-center gap-4">
                                {/* Badges moved to body */}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-8 min-h-0">
                    <div className="py-6 space-y-10 pb-10">
                        {mode === 'create' ? (
                            <>
                                {step === 1 && renderStep1()}
                                {step === 2 && renderStep2()}
                            </>
                        ) : (
                            <div className="space-y-12 pb-6">


                                {/* SECTION: BASIC IDENTITY & IMAGES */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                        <Info className="h-4 w-4 text-primary" />
                                        <h3 className="font-bold text-base uppercase tracking-tight">
                                            {mode === 'view' ? 'Ficha de Identidad' : 'Identidad y Perfil'}
                                        </h3>
                                    </div>
                                    <div className="space-y-10">
                                        {/* Profile Header: Avatar + Data */}
                                        {mode === 'view' ? (
                                            <div className="space-y-12">
                                                <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 items-start">
                                                    {/* Left Column: Avatar */}
                                                    <div className="space-y-2">
                                                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Avatar Principal</div>
                                                        <div className="aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm relative group">
                                                            {imageBase64 ? (
                                                                <img src={imageBase64} className="w-full h-full object-cover" alt="Avatar Principal" />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-zinc-300 dark:text-zinc-700">
                                                                    <Target className="h-20 w-20" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Right Column: Identity Data */}
                                                    <div className="space-y-6">
                                                        {renderStep1(true)}
                                                    </div>
                                                </div>

                                                {/* Contextual Identity Row (Full Width) */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-8 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                                                    <DataField label="Eje Principal" value={contextualIdentity.main_axis} />
                                                    <DataField label="Marco de Oposición" value={contextualIdentity.opposition_frame} />

                                                    <div className="md:col-span-2 space-y-2">
                                                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Audiencia</div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {contextualIdentity.target_audience.length > 0 ? (
                                                                contextualIdentity.target_audience.map((t, i) => (
                                                                    <Badge key={i} variant="secondary" className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                                                                        {t}
                                                                    </Badge>
                                                                ))
                                                            ) : <span className="text-zinc-400 italic text-xs">Sin etiquetas</span>}
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-2 space-y-2">
                                                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">No confundir con</div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {constraints.must_not_be_confused_with.length > 0 ? (
                                                                constraints.must_not_be_confused_with.map((t, i) => (
                                                                    <Badge key={i} variant="destructive" className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50">
                                                                        {t}
                                                                    </Badge>
                                                                ))
                                                            ) : <span className="text-zinc-400 italic text-xs">Sin restricciones</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            renderStep1(false)
                                        )}

                                        {/* Secondary Content: Other Images & Notes */}
                                        <div className={`p-6 rounded-xl border ${mode === 'view' ? 'border-zinc-100 dark:border-zinc-900/50 bg-white dark:bg-black' : 'border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/20'}`}>
                                            {renderStep2(mode === 'view')}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION: STRATEGIC ANALYSIS (WEIGHTS) */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                        <ArrowRightLeft className="h-4 w-4 text-primary" />
                                        <h3 className="font-bold text-base uppercase tracking-tight">Análisis Estratégico</h3>
                                        <InfoTooltip text="Define la importancia de cada eje en el análisis de comportamiento." />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-2">
                                        {Object.entries(comparisonWeights).map(([key, value]) => (
                                            <div key={key} className="space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <Label className="capitalize font-medium text-zinc-500 dark:text-zinc-400">
                                                        {key === 'visual' ? 'Visual' : (key === 'discourse' ? 'Discurso' : (key === 'behavior' ? 'Comportamiento' : 'Contexto'))}
                                                    </Label>
                                                    <span className="font-mono font-bold text-primary">{Math.round(value * 100)}%</span>
                                                </div>
                                                {mode === 'view' ? (
                                                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary" style={{ width: `${value * 100}%` }} />
                                                    </div>
                                                ) : (
                                                    <Slider
                                                        value={[value * 100]}
                                                        max={100}
                                                        step={1}
                                                        onValueChange={([v]) => setComparisonWeights(prev => ({ ...prev, [key]: v / 100 }))}
                                                        className="py-1"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SECTION: VISUAL DETAILS */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                        <Target className="h-4 w-4 text-primary" />
                                        <h3 className="font-bold text-base uppercase tracking-tight">Referencia Visual</h3>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Technical Specs: Scene, Focus, Quality */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[
                                                { label: "Escena", key: "scene", tooltip: "El entorno o fondo predominante." },
                                                { label: "Foco", key: "focus", tooltip: "El objeto o área principal de atención." },
                                                { label: "Calidad", key: "quality", tooltip: "Nivel de detalle y resolución." },
                                            ].map(item => (
                                                <div key={item.key}>
                                                    {mode === 'view' ? (
                                                        <DataField label={item.label} value={(visualReference as any)[item.key]} />
                                                    ) : (
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">{item.label}</Label>
                                                                <InfoTooltip text={item.tooltip} />
                                                            </div>
                                                            <Input
                                                                value={(visualReference as any)[item.key] || ""}
                                                                onChange={e => setVisualReference(prev => ({ ...prev, [item.key]: e.target.value }))}
                                                                className="h-9 text-sm bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 focus:ring-primary/20"
                                                                placeholder={`Fijar ${item.label.toLowerCase()}...`}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm">Logo o Nombre Visible</Label>
                                                <p className="text-xs text-muted-foreground">¿Es identificable la marca por texto o isotipo?</p>
                                            </div>
                                            {mode === 'view' ? (
                                                <Badge variant={visualReference.logo_or_name_visible ? "default" : "secondary"} className={visualReference.logo_or_name_visible ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" : ""}>
                                                    {visualReference.logo_or_name_visible ? "Sí" : "No"}
                                                </Badge>
                                            ) : (
                                                <Switch
                                                    checked={visualReference.logo_or_name_visible}
                                                    onCheckedChange={(v: boolean) => setVisualReference(prev => ({ ...prev, logo_or_name_visible: v }))}
                                                />
                                            )}
                                        </div>

                                        {/* Core Description: Appearance (Long Text) */}
                                        <div>
                                            {mode === 'view' ? (
                                                <DataField label="Apariencia General" value={visualReference.appearance} />
                                            ) : (
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Apariencia General</Label>
                                                        <InfoTooltip text="Descripción detallada del aspecto visual." />
                                                    </div>
                                                    <Textarea
                                                        value={visualReference.appearance || ""}
                                                        onChange={e => setVisualReference(prev => ({ ...prev, appearance: e.target.value }))}
                                                        rows={3}
                                                        className="text-sm bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 focus:ring-primary/20"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Tags: Colors, Notable Elements, Readable Text */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[
                                                { label: "Colores", key: "colors", field: "colors" },
                                                { label: "Elementos Notables", key: "notable_elements", field: "notable_elements" },
                                                { label: "Texto Legible", key: "readable_text", field: "readable_text" }
                                            ].map(item => (
                                                <div key={item.key} className="space-y-2">
                                                    <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">{item.label}</Label>
                                                    {mode === 'view' ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {(visualReference as any)[item.field]?.map((t: string, i: number) => (
                                                                <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>
                                                            )) || <span className="text-xs italic text-zinc-400">N/A</span>}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    size={1}
                                                                    className="h-8 text-xs"
                                                                    value={tempTags[item.field] || ""}
                                                                    onChange={e => setTempTags({ ...tempTags, [item.field]: e.target.value })}
                                                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag('visualReference', item.field, tempTags[item.field], item.field))}
                                                                    placeholder="..."
                                                                />
                                                                <Button size="sm" className="h-8 w-8" onClick={() => addTag('visualReference', item.field, tempTags[item.field], item.field)}>
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(visualReference as any)[item.field]?.map((t: string, i: number) => (
                                                                    <Badge key={i} variant="secondary" className="pr-1 py-0 h-6 text-[10px]">
                                                                        {t}
                                                                        <button type="button" onClick={() => removeTag('visualReference', item.field, i)} className="ml-1 text-zinc-400 hover:text-red-500"><X className="h-2.5 w-2.5" /></button>
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2 border-t shrink-0">
                    <div className="flex justify-between w-full">
                        {mode === 'create' ? (
                            <>
                                {step > 1 ? (
                                    <Button variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="mr-2 h-4 w-4" /> Anterior</Button>
                                ) : (
                                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                                )}

                                {step < 2 ? (
                                    <Button onClick={() => setStep(step + 1)}>Siguiente <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                ) : (
                                    <Button onClick={handleSubmit} disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {loading ? "Creando perfil..." : "Crear Objetivo"}
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={() => setOpen(false)}>
                                    {mode === 'view' ? "Cerrar" : "Cancelar"}
                                </Button>
                                {mode === 'edit' && (
                                    <Button onClick={handleSubmit} disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Guardar Cambios
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
