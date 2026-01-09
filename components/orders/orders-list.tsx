"use client"

import { useState } from "react"
import { MoreHorizontal, Trash2, ExternalLink, MessageSquare, Play, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
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
import { deleteOrder, startOrder } from "@/lib/actions/orders"
import { EditOrderButton } from "@/components/orders/edit-order-button"

type Order = {
    id: string
    link: string
    orderName: string
    socialNetwork: string
    postType: string
    intent: string | null
    quantity: number
    status: string
    createdAt: Date
    _count: {
        comments: number
    }
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    LISTA: { label: "Lista", variant: "outline" },
    GENERANDO: { label: "Generando...", variant: "default" },
    GENERADA: { label: "Completada", variant: "default" },
    CANCELADA: { label: "Cancelada", variant: "destructive" },
    REINTENTAR: { label: "Error / Reintentar", variant: "destructive" },
}

const NETWORK_LABELS: Record<string, string> = {
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    TIKTOK: "TikTok",
}

export function OrdersList({ orders, projectId }: { orders: Order[]; projectId: string }) {
    const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
    const [startingOrderId, setStartingOrderId] = useState<string | null>(null)
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

    async function handleStart(orderId: string) {
        setStartingOrderId(orderId)
        setError(null)

        const result = await startOrder(orderId)

        if (result.error) {
            setError(result.error)
        }
        setStartingOrderId(null)
    }

    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No hay órdenes</h3>
                    <p className="text-muted-foreground text-center mt-1">
                        Crea tu primera orden para comenzar a generar comentarios.
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
                    const isStarting = startingOrderId === order.id
                    const canStart = order.status === "LISTA"
                    const isCompleted = order.status === "GENERADA"
                    const isProcessing = order.status === "GENERANDO"

                    return (
                        <Card key={order.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold leading-none">
                                        {order.orderName || "Orden sin nombre"}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                                        <span>creada el {new Date(order.createdAt).toLocaleDateString("es")}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!canStart && !isProcessing && !isCompleted && (
                                        <Badge variant={statusInfo.variant} className="capitalize">
                                            {statusInfo.label}
                                        </Badge>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <a href={order.link} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Ver publicación
                                                </a>
                                            </DropdownMenuItem>
                                            {!isProcessing && !isCompleted && (
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => setDeletingOrder(order)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground font-medium uppercase">Plataforma</span>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-normal">
                                                {NETWORK_LABELS[order.socialNetwork] || order.socialNetwork}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground font-medium uppercase">Detalles</span>
                                        <div className="text-sm">
                                            {order.postType} · {order.quantity} coms.
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2">
                                    <p className="text-xs text-muted-foreground font-medium uppercase">
                                        Intención
                                    </p>
                                    <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                                        {order.intent || "Sin intención especificada"}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3 mt-4">
                                    <span className="flex items-center">
                                        <span className={`font-semibold mr-1 ${order._count.comments > 0 ? "text-primary" : ""}`}>
                                            {order._count.comments}
                                        </span>
                                        comentarios generados
                                    </span>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 pt-2">
                                    {canStart && (
                                        <>
                                            <EditOrderButton order={order} />
                                            <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleStart(order.id)}
                                                disabled={isStarting}
                                            >
                                                <Play className="mr-2 h-4 w-4" />
                                                {isStarting ? "Iniciando..." : "Empezar"}
                                            </Button>
                                        </>
                                    )}

                                    {isCompleted && (
                                        <Button size="sm" variant="outline" className="flex-1" asChild>
                                            <Link href={`/dashboard/orders/${order.id}/comments`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver comentarios
                                            </Link>
                                        </Button>
                                    )}

                                    {isProcessing && (
                                        <Button size="sm" variant="secondary" className="flex-1" disabled>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Procesando...
                                        </Button>
                                    )}

                                    {(order.status === "REINTENTAR" || order.status === "CANCELADA") && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="flex-1"
                                            onClick={() => handleStart(order.id)}
                                            disabled={isStarting}
                                        >
                                            <Play className="mr-2 h-4 w-4" />
                                            Reintentar
                                        </Button>
                                    )}
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
                            Esta acción no se puede deshacer. Se eliminará la orden y todos sus comentarios asociados.
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
