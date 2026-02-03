"use client"

import { useState } from "react"
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
import { updateOrder } from "@/lib/actions/orders"
import { Pencil } from "lucide-react"

type Order = {
    id: string
    url: string
    type: string
    socialNetwork: string
    postType: string
    intent: string | null
    quantity: number
    status: string
    orderName: string
}

const SOCIAL_NETWORKS = [
    { value: "INSTAGRAM", label: "Instagram" },
    { value: "FACEBOOK", label: "Facebook" },
    { value: "TIKTOK", label: "TikTok" },
]

const POST_TYPES = [
    { value: "VIDEO", label: "Video" },
    { value: "IMAGEN", label: "Imagen" },
    { value: "TEXTO", label: "Texto" },
    { value: "OTRO", label: "Otro" },
    { value: "PAGINA", label: "Página" },
    { value: "PUBLICACION", label: "Publicación" },
]

export function EditOrderButton({ order }: { order: Order }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [link, setLink] = useState(order.url)
    const [socialNetwork, setSocialNetwork] = useState(order.socialNetwork)
    const [postType, setPostType] = useState(order.postType)
    const [intent, setIntent] = useState(order.intent || "")
    const [quantity, setQuantity] = useState(String(order.quantity))
    const [orderName, setOrderName] = useState(order.orderName || "")
    const [error, setError] = useState("")

    // Can only edit if status is LISTA or REINTENTAR
    const canEdit = order.status === "LISTA" || order.status === "REINTENTAR"

    const handleSubmit = async () => {
        if (!link.trim()) return
        setLoading(true)
        setError("")

        const result = await updateOrder({
            id: order.id,
            link,
            socialNetwork: socialNetwork as "INSTAGRAM" | "FACEBOOK" | "TIKTOK",
            postType: postType as any,
            intent: order.type === "COMENTARIO" ? (intent || undefined) : undefined,
            quantity: Number(quantity) || 1,
            orderName: orderName,
        })

        setLoading(false)

        if (result.error) {
            setError(result.error)
            return
        }

        setOpen(false)
    }

    if (!canEdit) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 border-slate-200 shadow-sm">
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Orden</DialogTitle>
                    <DialogDescription>
                        Modifica los datos de la orden antes de procesarla.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="editOrderName">Nombre de la Orden</Label>
                        <Input
                            id="editOrderName"
                            value={orderName}
                            onChange={(e) => setOrderName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="editLink">Enlace de la publicación *</Label>
                        <Input
                            id="editLink"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editNetwork">Red Social</Label>
                            <Select value={socialNetwork} onValueChange={setSocialNetwork}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SOCIAL_NETWORKS.map((sn) => (
                                        <SelectItem key={sn.value} value={sn.value}>
                                            {sn.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editPostType">Tipo de Publicación</Label>
                            <Select value={postType} onValueChange={setPostType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {POST_TYPES.map((pt) => (
                                        <SelectItem key={pt.value} value={pt.value}>
                                            {pt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="editQuantity">
                            {order.type === "COMENTARIO" ? "Cantidad de comentarios" :
                                order.type === "MEGUSTA" ? "Cantidad de likes" :
                                    "Cantidad de shares"}
                        </Label>
                        <Input
                            id="editQuantity"
                            type="number"
                            min="1"
                            max="500"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                    </div>
                    {order.type === "COMENTARIO" && (
                        <div className="grid gap-2">
                            <Label htmlFor="editIntent">Intención de comentarios (opcional)</Label>
                            <Textarea
                                id="editIntent"
                                value={intent}
                                onChange={(e) => setIntent(e.target.value)}
                                placeholder="Describe el tono o estilo de los comentarios..."
                                rows={3}
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !link.trim() || !orderName.trim()}>
                        {loading ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
