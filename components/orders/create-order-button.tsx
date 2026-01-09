"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import { createOrder } from "@/lib/actions/orders"

const SOCIAL_NETWORKS = [
    { value: "INSTAGRAM", label: "Instagram" },
    { value: "FACEBOOK", label: "Facebook" },
    { value: "TIKTOK", label: "TikTok" },
]

const POST_TYPES = [
    { value: "IMAGEN", label: "Imagen" },
    { value: "VIDEO", label: "Video" },
    { value: "TEXTO", label: "Texto" },
]

export function CreateOrderButton({ projectId }: { projectId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [link, setLink] = useState("")
    const [socialNetwork, setSocialNetwork] = useState<"INSTAGRAM" | "FACEBOOK" | "TIKTOK">("INSTAGRAM")
    const [postType, setPostType] = useState<"IMAGEN" | "VIDEO" | "TEXTO">("IMAGEN")
    const [intent, setIntent] = useState("")
    const [quantity, setQuantity] = useState(5)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const result = await createOrder({
            projectId,
            link,
            socialNetwork,
            postType,
            intent: intent || undefined,
            quantity,
        })

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setOpen(false)
            resetForm()
            setLoading(false)
        }
    }

    function resetForm() {
        setLink("")
        setSocialNetwork("INSTAGRAM")
        setPostType("IMAGEN")
        setIntent("")
        setQuantity(5)
        setError(null)
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) resetForm()
        }}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Orden
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Orden de Comentarios</DialogTitle>
                        <DialogDescription>
                            Ingresa los datos de la publicación para generar comentarios.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="link">Enlace de la publicación</Label>
                            <Input
                                id="link"
                                placeholder="https://instagram.com/p/..."
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Red Social</Label>
                                <Select value={socialNetwork} onValueChange={(v) => setSocialNetwork(v as typeof socialNetwork)}>
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
                                <Label>Tipo de publicación</Label>
                                <Select value={postType} onValueChange={(v) => setPostType(v as typeof postType)}>
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
                            <Label htmlFor="quantity">Cantidad de comentarios</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min={1}
                                max={100}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="intent">Intención (opcional)</Label>
                            <Textarea
                                id="intent"
                                placeholder="Ej: Comentarios positivos sobre el producto, mencionando calidad y presentación..."
                                value={intent}
                                onChange={(e) => setIntent(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creando..." : "Crear Orden"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
