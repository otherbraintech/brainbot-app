"use client"

import { useState } from "react"
import { MoreHorizontal, Trash2, ExternalLink, MessageSquare, Play, Eye, Heart, Share2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { deleteOrder, startOrder } from "@/lib/actions/orders"
import { EditOrderButton } from "@/components/orders/edit-order-button"

type Order = {
    id: string
    url: string
    orderName: string
    type: string
    socialNetwork: string
    postType: string
    intent: string | null
    quantity: number
    status: string
    createdAt: Date
    _count: {
        genComments: number
        genLikes: number
        genShares: number
    }
}

const ORDER_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
    COMENTARIO: { label: "Comentarios", icon: MessageSquare, color: "text-muted-foreground bg-muted" },
    MEGUSTA: { label: "Me gusta", icon: Heart, color: "text-muted-foreground bg-muted" },
    COMPARTIR: { label: "Compartidos", icon: Share2, color: "text-muted-foreground bg-muted" },
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    LISTA: { label: "Listo para iniciar", variant: "outline" },
    GENERANDO: { label: "En proceso...", variant: "secondary" },
    GENERADA: { label: "Completado", variant: "default" },
    CANCELADA: { label: "Cancelada", variant: "destructive" },
    REINTENTAR: { label: "Error / Reintentar", variant: "destructive" },
}

const NETWORK_LABELS: Record<string, string> = {
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    TIKTOK: "TikTok",
}

const NETWORK_COLORS: Record<string, string> = {
    FACEBOOK: "bg-blue-50 text-blue-700 border-blue-100",
    INSTAGRAM: "bg-pink-50 text-pink-700 border-pink-100",
    TIKTOK: "bg-slate-900 text-white border-slate-800",
}

export function OrdersList({ orders, projectId }: { orders: Order[]; projectId: string }) {
    const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
    const [startingId, setStartingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleDelete() {
        if (!deletingOrder) return
        setLoading(true)
        setError(null)

        const result = await deleteOrder(deletingOrder.id)

        if (result.error) {
            setError(result.error)
        } else {
            setDeletingOrder(null)
        }
        setLoading(false)
    }

    async function handleStartOrder(orderId: string) {
        setStartingId(orderId)
        setError(null)
        const result = await startOrder(orderId)
        if (result.error) setError(result.error)
        setStartingId(null)
    }

    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No hay órdenes</h3>
                    <p className="text-muted-foreground text-center mt-1">
                        Crea tu primera orden para comenzar a interactuar.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 mb-4">
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders.map((order) => {
                    const statusInfo = STATUS_LABELS[order.status] || { label: order.status, variant: "secondary" as const }
                    const typeInfo = ORDER_TYPE_LABELS[order.type] || { label: order.type, icon: Play, color: "text-muted-foreground bg-muted" }
                    const isStarting = startingId === order.id
                    const isProcessing = order.status === "GENERANDO"
                    const isCompleted = order.status === "GENERADA"

                    const currentCount = order.type === "COMENTARIO" ? order._count.genComments :
                        order.type === "MEGUSTA" ? order._count.genLikes :
                            order._count.genShares

                    return (
                        <Card key={order.id} className="overflow-hidden transition-shadow hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-md ${typeInfo.color}`}>
                                            <typeInfo.icon className="h-4 w-4" />
                                        </div>
                                        <CardTitle className="text-md font-bold truncate max-w-[150px]">
                                            {order.orderName}
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <Badge variant="outline" className={`text-[9px] h-4 py-0 border-none ${NETWORK_COLORS[order.socialNetwork]}`}>
                                            {NETWORK_LABELS[order.socialNetwork] || order.socialNetwork}
                                        </Badge>
                                        <span>•</span>
                                        <span>{new Date(order.createdAt).toLocaleDateString("es")}</span>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-8 w-8 border-slate-200 shadow-sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(order.url, '_blank', 'noopener,noreferrer')}>
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Ver publicación
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => setDeletingOrder(order)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1 text-sm">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase block">Meta</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold">{order.quantity}</span>
                                            <span className="text-xs text-muted-foreground">solicitados</span>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase block">Realizados</span>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xl font-bold text-primary">{currentCount}</span>
                                            <span className="text-xs text-muted-foreground">exitosos</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div></div>

                                    <div className="flex gap-2 items-center">
                                        {!isCompleted && !isProcessing && (
                                            <EditOrderButton order={order as any} />
                                        )}

                                        {isCompleted && (
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold h-6 px-2">
                                                En cola
                                            </Badge>
                                        )}

                                        {isCompleted ? (
                                            order.type === "COMENTARIO" && (
                                                <Button variant="secondary" size="sm" className="h-8 text-xs font-bold px-4 border-slate-200 shadow-sm" asChild>
                                                    <Link href={`/dashboard/orders/${order.id}/comments`}>
                                                        <Eye className="mr-1.5 h-3.5 w-3.5" /> Ver comentarios
                                                    </Link>
                                                </Button>
                                            )
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="h-8 text-xs font-bold px-4"
                                                onClick={() => handleStartOrder(order.id)}
                                                disabled={isStarting || isProcessing}
                                            >
                                                {isStarting || isProcessing ? "En curso..." :
                                                    <><Play className="mr-1.5 h-3.5 w-3.5" /> Enviar orden</>}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingOrder} onOpenChange={() => setDeletingOrder(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar orden?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminarán todos los registros asociados a esta orden.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
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
