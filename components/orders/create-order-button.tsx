"use client"

import { useState } from "react"
import { Plus, X, Image as ImageIcon, Trash2, Hash, ExternalLink } from "lucide-react"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { TikTokIcon } from "@/components/icons/tiktok-icon"

import { createOrder, getNextOrderName } from "@/lib/actions/orders"
import { getAvailableDevicesCount } from "@/lib/actions/devices"

const SOCIAL_NETWORKS = [
    { value: "INSTAGRAM", label: "Instagram" },
    { value: "FACEBOOK", label: "Facebook" },
    { value: "TIKTOK", label: "TikTok" },
] as const

const POST_TYPES = [
    { value: "VIDEO", label: "Video" },
    { value: "IMAGEN", label: "Imagen" },
    { value: "TEXTO", label: "Texto" },
    { value: "LIVE", label: "Live" },
    { value: "OTRO", label: "Otro" },
] as const

const POST_TYPES_FOR_POST_ACTIONS = POST_TYPES.filter((pt) => pt.value !== "OTRO")

const REPORT_TYPES = [
    { value: "PAGINA", label: "Página" },
    { value: "PUBLICACION", label: "Publicación" },
] as const

const ORDER_TYPES = [
    { value: "COMENTARIO", label: "Comentarios" },
    { value: "MEGUSTA", label: "Me gusta" },
    { value: "COMPARTIR", label: "Compartidos" },
    { value: "SEGUIMIENTO", label: "Seguimiento" },
    { value: "REPORTE", label: "Reporte" },
    { value: "MARKETPLACE", label: "Marketplace" },
] as const

type SocialNetwork = typeof SOCIAL_NETWORKS[number]["value"]
type ReportType = (typeof REPORT_TYPES)[number]["value"]
type PostType = typeof POST_TYPES[number]["value"] | ReportType
type OrderType = typeof ORDER_TYPES[number]["value"]

export function CreateOrderButton({ projectId }: { projectId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [link, setLink] = useState("")
    const [socialNetwork, setSocialNetwork] = useState<SocialNetwork>("INSTAGRAM")
    const [postType, setPostType] = useState<PostType>("IMAGEN")
    const [reportType, setReportType] = useState<ReportType>("PUBLICACION")
    const [orderType, setOrderType] = useState<OrderType>("COMENTARIO")
    const [intent, setIntent] = useState("")
    const [quantity, setQuantity] = useState(5)
    const [orderName, setOrderName] = useState("")
    const [maxDevices, setMaxDevices] = useState(500)

    // Marketplace states
    const [mTitle, setMTitle] = useState("")
    const [mPrice, setMPrice] = useState(0)
    const [mCategory, setMCategory] = useState("Varios")
    const [mCondition, setMCondition] = useState("Nuevo")
    const [mDescription, setMDescription] = useState("")
    const [mImages, setMImages] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)

    const isPostAction = orderType === "COMENTARIO" || orderType === "MEGUSTA" || orderType === "COMPARTIR"
    const isReportAction = orderType === "REPORTE"
    const isMarketplaceAction = orderType === "MARKETPLACE"

    const handleOpenChange = async (newOpen: boolean) => {
        setOpen(newOpen)

        if (newOpen) {
            setError(null)
            const nextName = await getNextOrderName(projectId)
            setOrderName(nextName)

            // Get available devices count
            const availableCount = await getAvailableDevicesCount()
            setMaxDevices(availableCount > 0 ? availableCount : 1)
            setQuantity(Math.min(5, availableCount > 0 ? availableCount : 5))
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if ((!isMarketplaceAction && !link.trim()) || !orderName.trim()) return


        setLoading(true)
        setError(null)

        const result = await createOrder({
            projectId,
            link,
            socialNetwork,
            postType:
                orderType === "SEGUIMIENTO"
                    ? "PAGINA"
                    : isReportAction
                        ? reportType
                        : (isPostAction ? postType : "OTRO"),
            orderName,
            type: orderType,
            intent: orderType === "COMENTARIO" ? (intent || undefined) : undefined,
            quantity,
            marketplaceData: isMarketplaceAction ? {
                title: mTitle,
                price: Number(mPrice),
                category: mCategory,
                condition: mCondition,
                description: mDescription,
                images: mImages,
            } : undefined,
        })

        if (result?.error) {
            setError(result.error)
        } else {
            setOpen(false)
            resetForm()
        }

        setLoading(false)
    }

    function resetForm() {
        setLink("")
        setSocialNetwork("INSTAGRAM")
        setPostType("IMAGEN")
        setReportType("PUBLICACION")
        setOrderType("COMENTARIO")
        setIntent("")
        setQuantity(5)
        setOrderName("")
        setMTitle("")
        setMPrice(0)
        setMCategory("Varios")
        setMCondition("Nuevo")
        setMDescription("")
        setMImages([])
        setError(null)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto text-[10px] gap-2 border-indigo-200/60 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold uppercase tracking-widest shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
                    <Plus className="h-3.5 w-3.5" />
                    Nueva Orden
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl border-indigo-100/50">
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2 flex-shrink-0 bg-white/50 backdrop-blur-sm border-b border-muted/5">
                        <DialogTitle>Crear Nueva Orden</DialogTitle>
                        <DialogDescription>
                            Configura los detalles de la orden para iniciar el proceso de generación.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="orderName" className="text-[11px] font-bold opacity-70">Nombre de la Orden</Label>
                                <Input
                                    id="orderName"
                                    value={orderName}
                                    onChange={(e) => setOrderName(e.target.value)}
                                    placeholder="Ej: Orden #1"
                                    required
                                    className="h-9 focus-visible:ring-indigo-500"
                                />
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-3 text-xs text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label className="text-[11px] font-bold opacity-70">Tipo de Acción</Label>
                                <Select
                                    value={orderType}
                                    onValueChange={(v) => {
                                        const newType = v as OrderType
                                        setOrderType(newType)
                                         if (newType === "COMPARTIR" && socialNetwork === "INSTAGRAM") {
                                             setSocialNetwork("FACEBOOK")
                                         }
                                         if (newType === "MARKETPLACE" && socialNetwork !== "FACEBOOK") {
                                             setSocialNetwork("FACEBOOK")
                                         }
                                     }}
                                >
                                    <SelectTrigger className="h-9 focus:ring-indigo-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(ORDER_TYPES as any).map((ot: any) => (
                                            <SelectItem key={ot.value} value={ot.value}>
                                                {ot.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {!isMarketplaceAction && (
                                <div className="grid gap-2">
                                    <Label htmlFor="link" className="text-[11px] font-bold opacity-70">Enlace de la publicación</Label>
                                    <Input
                                        id="link"
                                        placeholder="https://facebook.com/..."
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        required={!isMarketplaceAction}
                                        className="h-9 focus-visible:ring-indigo-500"
                                    />
                                </div>
                            )}

                            {isPostAction && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-[11px] font-bold opacity-70">Red Social</Label>
                                        <Select
                                            value={socialNetwork}
                                            onValueChange={(v) => setSocialNetwork(v as SocialNetwork)}
                                        >
                                            <SelectTrigger className="h-9 focus:ring-indigo-500">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(SOCIAL_NETWORKS as any).map((sn: any) => {
                                                    const isDisabled = orderType === "COMPARTIR" && sn.value === "INSTAGRAM"
                                                    return (
                                                        <SelectItem
                                                            key={sn.value}
                                                            value={sn.value}
                                                            disabled={isDisabled}
                                                        >
                                                            {sn.label}{isDisabled ? " (No disponible)" : ""}
                                                        </SelectItem>
                                                    )
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="text-[11px] font-bold opacity-70">Tipo de publicación</Label>
                                        <Select
                                            value={postType}
                                            onValueChange={(v) => setPostType(v as PostType)}
                                        >
                                            <SelectTrigger className="h-9 focus:ring-indigo-500">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(POST_TYPES_FOR_POST_ACTIONS as any).map((pt: any) => (
                                                    <SelectItem key={pt.value} value={pt.value}>
                                                        {pt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {isMarketplaceAction && (
                                <div className="space-y-4 border-l-2 border-primary/20 pl-4 my-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80">Detalles del Producto</h4>
                                    </div>
                                    
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="mTitle" className="text-[11px] font-bold opacity-70">Título del Producto</Label>
                                        <Input
                                            id="mTitle"
                                            value={mTitle}
                                            onChange={(e) => setMTitle(e.target.value)}
                                            placeholder="Ej: iPhone 15 Pro Max 256GB"
                                            required={isMarketplaceAction}
                                            className="h-9 focus-visible:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="mPrice" className="text-[11px] font-bold opacity-70">Precio</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground opacity-50">$</span>
                                                <Input
                                                    id="mPrice"
                                                    type="number"
                                                    value={mPrice}
                                                    onChange={(e) => setMPrice(Number(e.target.value))}
                                                    required={isMarketplaceAction}
                                                    className="pl-7 h-9 focus-visible:ring-indigo-500 tabular-nums"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-[11px] font-bold opacity-70">Condición</Label>
                                            <Select value={mCondition} onValueChange={setMCondition}>
                                                <SelectTrigger className="h-9 focus:ring-indigo-500 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Nuevo">Nuevo</SelectItem>
                                                    <SelectItem value="Usado - Como nuevo">Usado - Como nuevo</SelectItem>
                                                    <SelectItem value="Usado - Buen estado">Usado - Buen estado</SelectItem>
                                                    <SelectItem value="Usado - Aceptable">Usado - Aceptable</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label className="text-[11px] font-bold opacity-70">Categoría</Label>
                                        <Select value={mCategory} onValueChange={setMCategory}>
                                            <SelectTrigger className="h-9 focus:ring-indigo-500 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Electrónica">Electrónica</SelectItem>
                                                <SelectItem value="Hogar">Hogar</SelectItem>
                                                <SelectItem value="Ropa">Ropa</SelectItem>
                                                <SelectItem value="Vehículos">Vehículos</SelectItem>
                                                <SelectItem value="Inmuebles">Inmuebles</SelectItem>
                                                <SelectItem value="Varios">Varios</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="mDescription" className="text-[11px] font-bold opacity-70">Descripción</Label>
                                        <Textarea
                                            id="mDescription"
                                            value={mDescription}
                                            onChange={(e) => setMDescription(e.target.value)}
                                            placeholder="Describe tu producto detalladamente..."
                                            rows={2}
                                            required={isMarketplaceAction}
                                            className="min-h-[80px] text-xs resize-none focus-visible:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="flex justify-between items-center text-[10px] uppercase font-black opacity-50 tracking-widest">
                                            Fotos del Producto
                                            {uploading && <span className="text-[9px] lowercase animate-pulse text-indigo-500">Subiendo...</span>}
                                        </Label>
                                        
                                        <div className="grid grid-cols-4 gap-2">
                                            {mImages.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-muted group border border-indigo-50 shadow-sm">
                                                    <img src={img} alt={`Preview ${idx}`} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setMImages(mImages.filter((_, i) => i !== idx))}
                                                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-500 hover:text-red-700 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            {mImages.length < 10 && (
                                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200/50 rounded-md aspect-square bg-indigo-50/20 hover:bg-indigo-50/50 hover:border-indigo-400 cursor-pointer transition-all">
                                                    <ImageIcon className="h-5 w-5 text-indigo-400 mb-1" />
                                                    <span className="text-[8px] font-bold uppercase text-indigo-500">Añadir</span>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        multiple 
                                                        className="hidden" 
                                                        onChange={async (e) => {
                                                            const files = Array.from(e.target.files || [])
                                                            if (files.length === 0) return
                                                            
                                                            setUploading(true)
                                                            try {
                                                                // Simulación de subida al VPS gestor de imágenes
                                                                // Usaría process.env.NEXT_PUBLIC_IMAGE_MANAGER_URL
                                                                const uploadUrl = process.env.NEXT_PUBLIC_IMAGE_MANAGER_URL || "https://images-vps.su-vps.com/upload"
                                                                
                                                                const newUrls = await Promise.all(
                                                                    files.map(async (file) => {
                                                                        const formData = new FormData()
                                                                        formData.append('file', file)
                                                                        
                                                                        // Simulación de fetch al VPS
                                                                        // const res = await fetch(uploadUrl, { method: "POST", body: formData })
                                                                        // return (await res.json()).url
                                                                        
                                                                        // Por ahora, usamos base64 local para demostración o URLs falsas
                                                                        return URL.createObjectURL(file) 
                                                                    })
                                                                )
                                                                setMImages([...mImages, ...newUrls])
                                                            } catch (err) {
                                                                console.error("Error uploading images:", err)
                                                            } finally {
                                                                setUploading(false)
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isReportAction && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-[11px] font-bold opacity-70">Red Social</Label>
                                        <Select
                                            value={socialNetwork}
                                            onValueChange={(v) => setSocialNetwork(v as SocialNetwork)}
                                        >
                                            <SelectTrigger className="h-9 focus:ring-indigo-500">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(SOCIAL_NETWORKS as any).map((sn: any) => (
                                                    <SelectItem key={sn.value} value={sn.value}>
                                                        {sn.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="text-[11px] font-bold opacity-70">Tipo de reporte</Label>
                                        <Select
                                            value={reportType}
                                            onValueChange={(v) => setReportType(v as ReportType)}
                                        >
                                            <SelectTrigger className="h-9 focus:ring-indigo-500">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(REPORT_TYPES as any).map((rt: any) => (
                                                    <SelectItem key={rt.value} value={rt.value}>
                                                        {rt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {!isPostAction && !isReportAction && (
                                <div className="grid gap-2">
                                    <Label className="text-[11px] font-bold opacity-70">Red Social</Label>
                                    <Select
                                        value={socialNetwork}
                                        onValueChange={(v) => setSocialNetwork(v as SocialNetwork)}
                                    >
                                        <SelectTrigger className="h-9 focus:ring-indigo-500">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(SOCIAL_NETWORKS as any).map((sn: any) => (
                                                <SelectItem key={sn.value} value={sn.value}>
                                                    {sn.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="quantity" className="text-[11px] font-bold opacity-70">
                                    {orderType === "COMENTARIO" ? "Cantidad de comentarios" :
                                        orderType === "MEGUSTA" ? "Cantidad de likes" :
                                            orderType === "COMPARTIR" ? "Cantidad de shares" :
                                                orderType === "SEGUIMIENTO" ? "Cantidad de seguidores" :
                                                    "Cantidad de reportes"}
                                </Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min={1}
                                    max={maxDevices}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.min(Number(e.target.value) || 1, maxDevices))}
                                    required
                                    className="h-9 focus-visible:ring-indigo-500 tabular-nums"
                                />
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <Hash className="h-3 w-3" />
                                    <span className="text-[10px] font-medium">Dispositivos disponibles: {maxDevices}</span>
                                </div>
                            </div>

                            {orderType === "COMENTARIO" && (
                                <div className="grid gap-2 pb-2">
                                    <Label htmlFor="intent" className="text-[11px] font-bold opacity-70">Intención de los comentarios (opcional)</Label>
                                    <Textarea
                                        id="intent"
                                        placeholder="Ej: Comentarios naturales y positivos sobre el producto"
                                        value={intent}
                                        onChange={(e) => setIntent(e.target.value)}
                                        rows={2}
                                        className="max-h-24 min-h-[60px] text-xs resize-none focus-visible:ring-indigo-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
 
                    <DialogFooter className="p-6 pt-3 flex-shrink-0 bg-white border-t border-muted/10">
                        <Button
                            type="button"
                            variant="secondary"
                            className="h-10 text-xs px-6 border-slate-200"
                            onClick={() => setOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || (!isMarketplaceAction && !link.trim()) || !orderName.trim()}
                            className="h-10 text-xs px-8 bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                        >
                            {loading ? "Creando..." : "Crear Orden"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
