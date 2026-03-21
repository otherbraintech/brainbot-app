"use client"

import { useState } from "react"
import { Plus, X, Image as ImageIcon, Trash2 } from "lucide-react"

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
import { ScrollArea } from "@/components/ui/scroll-area"

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
    const [mLocation, setMLocation] = useState("")
    const [mDescription, setMDescription] = useState("")
    const [mImages, setMImages] = useState<string[]>([""])

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
                location: mLocation,
                description: mDescription,
                images: mImages.filter(img => img.trim() !== ""),
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
        setMLocation("")
        setMDescription("")
        setMImages([""])
        setError(null)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Orden
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Orden</DialogTitle>
                        <DialogDescription>
                            Configura los detalles de la orden para iniciar el proceso de generación.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[70vh] px-1">
                        <div className="grid gap-4 py-4 pr-3">
                            <div className="grid gap-2">
                                <Label htmlFor="orderName">Nombre de la Orden</Label>
                                <Input
                                    id="orderName"
                                    value={orderName}
                                    onChange={(e) => setOrderName(e.target.value)}
                                    placeholder="Ej: Orden #1"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label>Tipo de Acción</Label>
                                <Select
                                    value={orderType}
                                    onValueChange={(v) => {
                                        const newType = v as OrderType
                                        setOrderType(newType)
                                        // Auto-switch from Instagram to Facebook if COMPARTIR is selected
                                         if (newType === "COMPARTIR" && socialNetwork === "INSTAGRAM") {
                                             setSocialNetwork("FACEBOOK")
                                         }
                                         if (newType === "MARKETPLACE" && socialNetwork !== "FACEBOOK") {
                                             setSocialNetwork("FACEBOOK")
                                         }
                                     }}
                                >
                                    <SelectTrigger>
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
                                    <Label htmlFor="link">Enlace de la publicación</Label>
                                    <Input
                                        id="link"
                                        placeholder="https://facebook.com/..."
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        required={!isMarketplaceAction}
                                    />
                                </div>
                            )}


                            {isPostAction && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Red Social</Label>
                                        <Select
                                            value={socialNetwork}
                                            onValueChange={(v) => setSocialNetwork(v as SocialNetwork)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(SOCIAL_NETWORKS as any).map((sn: any) => {
                                                    // Disable Instagram for COMPARTIR (Share) orders
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
                                        <Label>Tipo de publicación</Label>
                                        <Select
                                            value={postType}
                                            onValueChange={(v) => setPostType(v as PostType)}
                                        >
                                            <SelectTrigger>
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
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Detalles del Producto</h4>
                                    
                                    <div className="grid gap-2">
                                        <Label htmlFor="mTitle">Título del Producto</Label>
                                        <Input
                                            id="mTitle"
                                            value={mTitle}
                                            onChange={(e) => setMTitle(e.target.value)}
                                            placeholder="Ej: iPhone 15 Pro Max 256GB"
                                            required={isMarketplaceAction}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="mPrice">Precio</Label>
                                            <Input
                                                id="mPrice"
                                                type="number"
                                                value={mPrice}
                                                onChange={(e) => setMPrice(Number(e.target.value))}
                                                required={isMarketplaceAction}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Condición</Label>
                                            <Select value={mCondition} onValueChange={setMCondition}>
                                                <SelectTrigger>
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Categoría</Label>
                                            <Select value={mCategory} onValueChange={setMCategory}>
                                                <SelectTrigger>
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
                                        <div className="grid gap-2">
                                            <Label htmlFor="mLocation">Ubicación (Opcional)</Label>
                                            <Input
                                                id="mLocation"
                                                value={mLocation}
                                                onChange={(e) => setMLocation(e.target.value)}
                                                placeholder="Ej: Madrid, España"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="mDescription">Descripción</Label>
                                        <Textarea
                                            id="mDescription"
                                            value={mDescription}
                                            onChange={(e) => setMDescription(e.target.value)}
                                            placeholder="Describe tu producto detalladamente..."
                                            rows={4}
                                            required={isMarketplaceAction}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="flex justify-between items-center">
                                            Imágenes (URLs)
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-7 text-[10px] uppercase font-bold"
                                                onClick={() => setMImages([...mImages, ""])}
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Añadir Imagen
                                            </Button>
                                        </Label>
                                        <div className="space-y-2">
                                            {mImages.map((img, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <Input
                                                        value={img}
                                                        onChange={(e) => {
                                                            const newImages = [...mImages]
                                                            newImages[idx] = e.target.value
                                                            setMImages(newImages)
                                                        }}
                                                        placeholder="https://..."
                                                        className="flex-1"
                                                    />
                                                    {mImages.length > 1 && (
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-10 w-10 text-red-500"
                                                            onClick={() => setMImages(mImages.filter((_, i) => i !== idx))}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isReportAction && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Red Social</Label>
                                        <Select
                                            value={socialNetwork}
                                            onValueChange={(v) => setSocialNetwork(v as SocialNetwork)}
                                        >
                                            <SelectTrigger>
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
                                        <Label>Tipo de reporte</Label>
                                        <Select
                                            value={reportType}
                                            onValueChange={(v) => setReportType(v as ReportType)}
                                        >
                                            <SelectTrigger>
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
                                    <Label>Red Social</Label>
                                    <Select
                                        value={socialNetwork}
                                        onValueChange={(v) => setSocialNetwork(v as SocialNetwork)}
                                    >
                                        <SelectTrigger>
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
                                <Label htmlFor="quantity">
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
                                />
                                <p className="text-xs text-muted-foreground">
                                    Dispositivos disponibles: {maxDevices}
                                </p>
                            </div>

                            {orderType === "COMENTARIO" && (
                                <div className="grid gap-2">
                                    <Label htmlFor="intent">Intención de los comentarios (opcional)</Label>
                                    <Textarea
                                        id="intent"
                                        placeholder="Ej: Comentarios naturales y positivos sobre el producto"
                                        value={intent}
                                        onChange={(e) => setIntent(e.target.value)}
                                        rows={3}
                                        className="max-h-32 overflow-y-auto"
                                    />
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            className="border-slate-200"
                            onClick={() => setOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !link.trim() || !orderName.trim()}
                        >
                            {loading ? "Creando..." : "Crear"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
